'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Search,
  Sparkles,
  User as UserIcon,
  Users,
  UserPlus,
  UserMinus,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { UserResponse } from '../models/userSchema';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

/**
 * Builds a fallback-safe full name for users across list and button labels.
 */
function getDisplayName(user: Pick<UserResponse, 'firstName' | 'lastName' | '_id'>) {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return fullName || `User ${user._id}`;
}

/**
 * Reusable row layout for friend, suggestion, and search result entries.
 */
function FriendRow({
  user,
  subtitle,
  action,
}: {
  user: UserResponse;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="font-semibold text-gray-900">{getDisplayName(user)}</p>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * Friends dashboard showing the current user's network, suggestions, and search.
 */
export default function FriendsPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, updateUserProfile } = useAuth();
  const updateUserProfileRef = useRef(updateUserProfile);

  // Backing data for the directory, the current signed-in user, and page-level UI states.
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(user);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);

  // Protects the page by redirecting unauthenticated visitors to the login screen.
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Mirrors the auth-context user into local state so the page can react to auth changes.
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Stores the latest profile updater in a ref so async callbacks can use it safely.
  useEffect(() => {
    updateUserProfileRef.current = updateUserProfile;
  }, [updateUserProfile]);

  // Fetches the current user record plus the full user list used for friends, suggestions, and search.
  useEffect(() => {
    /**
     * Loads the current user and the full user directory used for friends features.
     */
    const loadFriendsPageData = async () => {
      if (!user?._id) {
        setPageLoading(false);
        return;
      }

      setPageLoading(true);
      setPageError(null);

      try {
        const [currentUserResponse, allUsersResponse] = await Promise.all([
          fetch(`/api/users/${user._id}`),
          fetch('/api/users'),
        ]);

        if (!currentUserResponse.ok) {
          throw new Error('Failed to load your account details.');
        }

        if (!allUsersResponse.ok) {
          throw new Error('Failed to load users.');
        }

        const currentUserData: UserResponse = await currentUserResponse.json();
        const usersPayload: { users: UserResponse[] } = await allUsersResponse.json();

        setCurrentUser(currentUserData);
        setAllUsers(usersPayload.users ?? []);
        updateUserProfileRef.current(currentUserData);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Something went wrong while loading friends.';
        setPageError(message);
      } finally {
        setPageLoading(false);
      }
    };

    loadFriendsPageData();
  }, [user?._id]);

  // Extracts friend ids once so the rest of the page can derive lists from a single source
  const friendIds = useMemo(() => currentUser?.friends ?? [], [currentUser]);

  // Resolves the current user's friend ids into full user objects for the Friends section.
  const friendUsers = useMemo(() => {
    const friendIdSet = new Set(friendIds);

    return allUsers
      .filter((candidate) => friendIdSet.has(candidate._id))
      .sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));
  }, [allUsers, friendIds]);

  // Builds People You May Know by finding non-friends who share mutual friends with the current user.
  const suggestedUsers = useMemo(() => {
    if (!currentUser?._id) return [];

    const currentFriendSet = new Set(friendIds); // performance optimization for O(1) lookups in the filter/map below

    return allUsers
      .filter((candidate) => candidate._id !== currentUser._id && !currentFriendSet.has(candidate._id)) // Exclude self and existing friends from suggestions.
      .map((candidate) => { 
        const candidateFriendIds = candidate.friends ?? [];
        const mutualFriendIds = candidateFriendIds.filter((friendId) => currentFriendSet.has(friendId)); // compare candidate's friends against current user's friends to find mutuals

        // Return an augmented user object that includes the mutual friend ids for sorting and display in the suggestions list.
        return {
          ...candidate,
          mutualFriendIds,
        };
      })
      .filter((candidate) => candidate.mutualFriendIds.length > 0) // Only suggest users who have at least one mutual friend to ensure relevance.
      .sort((a, b) => { // sort primarily by number of mutual friends (descending), then alphabetically by name as a tiebreaker
        if (b.mutualFriendIds.length !== a.mutualFriendIds.length) {
          return b.mutualFriendIds.length - a.mutualFriendIds.length;
        }

        return getDisplayName(a).localeCompare(getDisplayName(b));
      });
  }, [allUsers, currentUser, friendIds]);

  // Filters the directory by the current search text and excludes the user and existing friends.
  const searchableUsers = useMemo(() => {
    if (!currentUser?._id) return [];

    const normalizedQuery = searchQuery.trim().toLowerCase(); // normalize the search query for case-insensitive matching and to ignore leading/trailing whitespace
    if (!normalizedQuery) return [];

    const currentFriendSet = new Set(friendIds); // performance optimization

    return allUsers
      .filter((candidate) => candidate._id !== currentUser._id && !currentFriendSet.has(candidate._id)) // Exclude self and existing friends from search results.
      .filter((candidate) =>
        getDisplayName(candidate).toLowerCase().includes(normalizedQuery) // compare the normalized search query against the candidate's display name for a match
      )
      .sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));
  }, [allUsers, currentUser, friendIds, searchQuery]);

  /**
   * Keeps component state and auth context aligned after friend mutations.
   */
  const refreshLocalUserState = (updatedUser: UserResponse) => {
    setCurrentUser(updatedUser);
    updateUserProfileRef.current(updatedUser);
  };

  /**
   * Logs the user out and returns them to the landing page.
   */
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  /**
   * Adds a selected user to the current user's friends list in the database.
   */
  const handleAddFriend = async (friendToAdd: UserResponse) => {
    // if not logged in or user data is missing, show an error and don't proceed with the friend request
    if (!currentUser?._id) {
      toast.error('You must be logged in to add friends.');
      return;
    }

    // if the selected friend is already in the user's friends list, don't do anything (this should be prevented by the UI but we check again here for safety)
    if ((currentUser.friends ?? []).includes(friendToAdd._id)) {
      return;
    }

    setAddingFriendId(friendToAdd._id);

    try {
      const updatedFriends = [...(currentUser.friends ?? []), friendToAdd._id]; // create a new array of friend ids that includes the new friend to add
      // send a PUT request to update the user's friends list in the database with the new array of friend idsq
      const response = await fetch(`/api/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friends: updatedFriends }),
      });

      // if the response is not ok, throw an error to be caught in the catch block below
      if (!response.ok) {
        throw new Error('Failed to add friend.');
      }

      // get the updated user data from response
      const updatedUser: UserResponse = await response.json();
      // update the local component state and auth context with the updated user data to reflect the new friend in the UI
      refreshLocalUserState(updatedUser);
      toast.success(`${getDisplayName(friendToAdd)} added to your friends.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add friend.';
      toast.error(message);
    } finally {
      setAddingFriendId(null);
    }
  };

  /**
   * Removes a selected user from the current user's friends list in the database.
   */
  const handleRemoveFriend = async (friendToRemove: UserResponse) => {
    if (!currentUser?._id) {
      toast.error('You must be logged in to manage friends.');
      return;
    }

    if (!(currentUser.friends ?? []).includes(friendToRemove._id)) {
      return;
    }

    setAddingFriendId(friendToRemove._id);

    try {
        // Create a new array of friend ids that excludes the friend to remove by filtering them out of the existing friends array
        const updatedFriends = (currentUser.friends ?? []).filter(
        (friendId) => friendId !== friendToRemove._id
      );
      // Send a PUT request to update the user's friends list in the database with the new array of friend ids that no longer includes the removed friend
      const response = await fetch(`/api/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friends: updatedFriends }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend.');
      }

      const updatedUser: UserResponse = await response.json();
      refreshLocalUserState(updatedUser);
      toast.success(`${getDisplayName(friendToRemove)} removed from your friends.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove friend.';
      toast.error(message);
    } finally {
      setAddingFriendId(null);
    }
  };

  if (!user) return null;

  return (
    // Full friends page wrapper beneath the app shell.
    <div className="min-h-screen bg-gray-50">
      {/* Navigation header - shows user info and auth/logout buttons */}
      <header className="bg-gradient-to-r from-red-600 to-black text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Navbar content: app brand on the left, profile/actions on the right. */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* App logo and title linking back to the home page. */}
            <div className="flex items-center gap-3" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
              <Sparkles className="w-8 h-8" />
              <h1 className="text-2xl md:text-3xl font-bold">ClassicCity<span className="text-red-500">Social</span></h1>
            </div>

            {/* Navbar action group for profile access, logout, and events navigation. */}
            <div className="flex items-center gap-3">
              <>
                <div
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => router.push('/profile')}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{user?.firstName + ' ' + user?.lastName}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-white/30 text-black hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
                <Button
                  onClick={() => router.push('/events')}
                  variant="outline"
                  className="border-white/30 text-black hover:bg-white/10 hover:text-white"
                >
                  <span className="hidden md:inline">Events</span>
                </Button>
              </>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area under the navbar. */}
      <main className="container mx-auto px-4 py-8">
        {/* Intro hero card with page title, supporting copy, and search input. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Community</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">Friends</h1>
              <p className="mt-2 max-w-2xl text-gray-600">
                Keep up with your circle, discover mutual connections, and add new friends across ClassicCitySocial.
              </p>
            </div>

            <div className="w-full max-w-xl">
              <label className="mb-2 block text-sm font-medium text-gray-700">Search people by name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for people to add..."
                  className="pl-11"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {pageLoading ? (
          // Loading state shown while user and directory data are being fetched.
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
            <p className="mt-4 text-gray-600">Loading your friends network...</p>
          </div>
        ) : pageError ? (
          // Error state shown if the page could not load the needed user data.
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-semibold">Unable to load this page</p>
            <p className="mt-2 text-sm">{pageError}</p>
          </div>
        ) : (
          // Two-column dashboard layout for friends/search on the left and suggestions on the right.
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1.35fr]">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-6"
            >
              {/* Friends list card driven directly from the current user's friends array. */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Friends</h2>
                    <p className="text-sm text-gray-500">
                      {friendUsers.length} {friendUsers.length === 1 ? 'friend' : 'friends'} in your network
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {friendUsers.length > 0 ? (
                    friendUsers.map((friend) => (
                      <FriendRow
                        key={friend._id}
                        user={friend}
                        subtitle="Already connected"
                        action={
                          <Button
                            onClick={() => handleRemoveFriend(friend)}
                            disabled={addingFriendId === friend._id}
                            variant="outline"
                            className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-100"
                          >
                            {addingFriendId === friend._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserMinus className="h-4 w-4" />
                            )}
                            Remove
                          </Button>
                        }
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                      Your friends list is empty right now. Try adding someone from suggestions or search.
                    </div>
                  )}
                </div>
              </div>

              {/* Search results card for finding more users to add by name. */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
                <p className="mt-1 text-sm text-gray-500">Search dynamically by first and last name.</p>

                <div className="mt-6 space-y-3">
                  {searchQuery.trim() === '' ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                      Start typing to search for people to add.
                    </div>
                  ) : searchableUsers.length > 0 ? (
                    searchableUsers.map((candidate) => {
                      const mutualCount = (candidate.friends ?? []).filter((friendId) => friendIds.includes(friendId)).length;

                      return (
                        <FriendRow
                          key={candidate._id}
                          user={candidate}
                          subtitle={
                            mutualCount > 0
                              ? `${mutualCount} mutual ${mutualCount === 1 ? 'friend' : 'friends'}`
                              : 'No mutual friends yet'
                          }
                          action={
                            <Button
                              onClick={() => handleAddFriend(candidate)}
                              disabled={addingFriendId === candidate._id}
                              className="gap-2 bg-yellow-500 text-black hover:bg-yellow-600"
                            >
                              {addingFriendId === candidate._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserPlus className="h-4 w-4" />
                              )}
                              Add Friend
                            </Button>
                          }
                        />
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                      No users matched your search.
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              {/* Suggested users card based on mutual-friend relationships. */}
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-black p-3 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">People You May Know</h2>
                  <p className="text-sm text-gray-500">Suggested from mutual-friend relationships in your network.</p>
                </div>
              </div>

              <div className="space-y-3">
                {suggestedUsers.length > 0 ? (
                  suggestedUsers.map((candidate) => (
                    <FriendRow
                      key={candidate._id}
                      user={candidate}
                      subtitle={`${candidate.mutualFriendIds.length} mutual ${candidate.mutualFriendIds.length === 1 ? 'friend' : 'friends'}`}
                      action={
                        <Button
                          onClick={() => handleAddFriend(candidate)}
                          disabled={addingFriendId === candidate._id}
                          className="gap-2 bg-yellow-500 text-black hover:bg-yellow-600"
                        >
                          {addingFriendId === candidate._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                          Add Friend
                        </Button>
                      }
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                    No mutual-friend suggestions yet. Search for people to start growing your network.
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        )}
      </main>
    </div>
  );
}
