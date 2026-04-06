import { NextResponse as Response } from 'next/server';
// import { mongoose } from 'mongoose'; - add later when DB is set up
import { mockEvents } from '../../data/mockData';
import { Event } from '../../data/mockData';

/*
 * Currently, these functions are implemented for mock data. Once the database is set up, we will replace the mock data with actual database queries using Mongoose.
 * Considerations/Changes when DB is set up: 
 * - We will need to handle asynchronous operations with the database, so all functions will need to be async and use await for database queries.
 * - We will need to add error handling for database operations, such as try/catch blocks to catch any errors that may occur during database interactions and return 
 * appropriate error responses.
 * - For the POST and PUT operations, we will need to validate the incoming data before attempting to create or update an event in the database. 
 * This could involve checking for required fields, validating data types, and ensuring that the data meets any constraints defined in our Mongoose schema.
 * - Add necessary mongoDB connections and queries
 * - enum validator for event source: enum: ['user', 'ticketmaster', 'eventbrite', 'athens_data']
 */

// Read CRUD operation for events
export async function GET() { return Response.json({ events : mockEvents }, { status: 200});}

// Create CRUD operation for events
export async function POST(request: Request) { // Request is the incoming request object from Next.js API route
    const body = await request.json(); // body is the parsed JSON data from the request, which should contain the event details (either from a user or API source)
    // Create a new event object with a unique ID, attendees and reviews are initialized as empty because this is a new event. source is set to 'user' for now. 
    const newEvent: Event = { ...body, id: Date.now().toString(), attendees: [], reviews: [], source: 'user' }; 
    // Add the new event to the mockEvents array. Will be changed to a database insert operation once DB is set up.
    mockEvents.push(newEvent);
    // Return the newly created event in the response with a 201 status code indicating successful creation
    return Response.json({ event : newEvent }, { status: 201 }); 
}

// Update CRUD operation for events
// with DB, will use findByIdAndUpdate
export async function PUT(request: Request) { 
    const body = await request.json(); // same as POST
    const index = mockEvents.findIndex(event => event.id === body.id); // find the index of the event to update based on the ID provided in the request body
    // if the event is not found, returns a 404 error response
    if (index === -1) {
        return Response.json({ error: 'Event not found' }, { status: 404 });
    }        
    // Update the event by merging existing data with request body - allows for partial updates as body does not need to contain all fields
    // Something to consider when database is set up - we most likely will not want all fields to be updatable (source, createdBy, reviews)
    mockEvents[index] = { ...mockEvents[index], ...body };    
    // Return the updated event in the response with a 200 status code
    return Response.json({ event : mockEvents[index] }, { status: 200 }); 
}

// Delete CRUD operation for events
// with DB, will use findByIdAndDelete
export async function DELETE(request: Request) { 
    const { id } = await request.json(); // shorthand to extract event ID from the request body
    // get the index of event to be deleted
    const index = mockEvents.findIndex(event => event.id === id);
    // if the event is not found, returns a 404 error response
    if (index === -1) {
        return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    // Removes the event from mockEvents that is at {index} and removes just 1 element
    mockEvents.splice(index, 1);
    // Return a success message in the response with a 200 status code
    return Response.json({ message: 'Event deleted successfully' }, { status: 200 }); 
}