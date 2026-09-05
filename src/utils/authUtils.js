
export const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        // Decode the JWT payload (the middle part of the token)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);

        // .NET ClaimTypes.NameIdentifier usually maps to this long schema URL, or 'sub' / 'nameid'
        return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
            || decoded.sub
            || decoded.nameid;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};