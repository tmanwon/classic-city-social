export async function uploadImage(image: string) {
    const response = await fetch('/api/imageUrl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: image,
        }),
    });
    const url = (await response.json()).data.data.url;
    return url;
}