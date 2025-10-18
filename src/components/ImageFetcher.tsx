import axios from 'axios';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { baseUrl } from '../constants/baseURL';

interface RequestHeader {
    [key: string]: string;
}
interface ImageFetcherProps {
    fileName: string | null;
    altText: string;
    className?: string;
    fallbackText: string;
    showFilename?: boolean; // New prop to control filename display
}

interface UserDetails {
    username?: string;
    token?: string;
    userId?: string;
    roles?: string;
    firstName: string;
    lastName: string;
}
interface PersonalDetails {
    airports?: string[];
    logo?: string;
}

const generateRandomColor = (seed: string): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

const ImageFetcher: React.FC<ImageFetcherProps> = ({ fileName, altText, className, fallbackText, showFilename = false }) => {

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const [roleSideBar, setRoleSideBar] = useState<UserDetails>({
        username: '',
        token: '',
        userId: '',
        roles: '',
        firstName: '',
        lastName: ''
    });
    const [userPdetails, setUserPdetails] = useState<PersonalDetails | null>(null);

    const bgColor = useMemo(() => {
        return generateRandomColor(fallbackText);
    }, [fallbackText]);

    // Function to extract the base filename from a URL
    const getBaseFilename = (url: string | null): string => {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            // Get the pathname (e.g., /uploads/Profile/manojmv%40gmail.com/1000084742.jpg)
            const pathname = urlObj.pathname;
            // Split by '/' and get the last part
            let baseName = pathname.substring(pathname.lastIndexOf('/') + 1);
            // Decode URI component to handle %40 for @, etc.
            return decodeURIComponent(baseName);
        } catch (e) {
            console.error("Error parsing URL for filename:", e);
            return url; // Return the original if parsing fails
        }
    };

    const displayFilename = useMemo(() => getBaseFilename(fileName), [fileName]);


    useEffect(() => {
        const loginDetails = localStorage.getItem('loginDetails');
        const userPersonalDetails = localStorage.getItem('userPersonalDetails');

        if (loginDetails) {
            try {
                const userDetails: UserDetails = JSON.parse(loginDetails);
                setRoleSideBar(userDetails);

                if (userPersonalDetails) {
                    const personalDetails: PersonalDetails = JSON.parse(userPersonalDetails);
                    setUserPdetails(personalDetails);
                } else {
                    console.log('No personal details found in localStorage.');
                }
            } catch (err) {
                console.error('Error parsing user details from localStorage:', err);
                setRoleSideBar({ username: '', token: '', userId: '', roles: '', firstName: '', lastName: '' });
            }
        }
    }, []);

    // const fetchImage = useCallback(async (): Promise<string | null> => {
    //     if (!fileName || !roleSideBar?.token) {
    //         setLoading(false);
    //         setImageUrl(null);
    //         setError(!roleSideBar?.token && !!fileName);
    //         return null;
    //     }

    //     if (fileName.startsWith('https://')) {
    //         console.log(fileName, 'image');
    //         try {
    //             // const response = await fetch(fileName, { method: 'GET' });
    //             // if (response.ok) {
    //             setImageUrl(fileName);
    //             setLoading(false);
    //             setError(false);
    //             return fileName;
    //             // } else {
    //             //     console.warn(`Image URL returned status ${response.status}`);
    //             //     setError(true);
    //             //     setImageUrl(null);
    //             //     setLoading(false);
    //             //     return null;
    //             // }
    //         } catch (error) {
    //             console.error("Error accessing image URL:", error);
    //             setError(true);
    //             setImageUrl(null);
    //             setLoading(false);
    //             return null;
    //         }
    //     }

    //     setLoading(true);
    //     setError(false);
    //     let currentObjectUrl: string | null = null;

    //     try {
    //         const apiUrl = baseUrl + `app/file?fileName=${fileName}`;
    //         const headers: RequestHeader = {
    //             'Authorization': `Bearer ${roleSideBar.token}`,
    //         };

    //         const response = await axios.get(apiUrl, {
    //             headers: headers,
    //             responseType: 'arraybuffer'
    //         });

    //         if (response.status !== 200) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const imageBlob = new Blob([response.data], { type: response.headers['content-type'] });
    //         currentObjectUrl = URL.createObjectURL(imageBlob);
    //         setImageUrl(currentObjectUrl);

    //     } catch (err) {
    //         console.error("Failed to fetch image:", err);
    //         setError(true);
    //         setImageUrl(null);
    //         currentObjectUrl = null;
    //     } finally {
    //         setLoading(false);
    //     }

    //     return currentObjectUrl;
    // }, [fileName, roleSideBar.token]);

    const fetchImage = useCallback(async (): Promise<string | null> => {
        if (!fileName) {
            setLoading(false);
            setImageUrl(null);
            setError(true);
            return null;
        }

        // If it's a valid external image URL
        if (fileName.startsWith('https://')) {
            setImageUrl(fileName);
            setLoading(false);
            setError(false);
            return fileName;
        }

        // If it's not an external URL, return error (or handle accordingly)
        setImageUrl(null);
        setError(true);
        setLoading(false);
        return null;
    }, [fileName]);



    useEffect(() => {
        let cleanupUrl: string | null = null;
        fetchImage().then(url => {
            cleanupUrl = url;
        });

        return () => {
            if (cleanupUrl) {
                URL.revokeObjectURL(cleanupUrl);
            }
        };
    }, [fetchImage]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center ${className} bg-gray-200 rounded-full text-gray-500`}>
                <span className="text-sm font-semibold">{fallbackText.charAt(0).toUpperCase()}</span>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div
                className={`flex items-center justify-center ${className} rounded-full text-white`}
                style={{ backgroundColor: bgColor }}
                title={error ? `Error loading image for ${altText}` : `No image for ${altText}`}
            >
                <span className="text-sm font-semibold">{fallbackText.charAt(0).toUpperCase()}</span>
            </div>
        );
    }

    return (
        // You can wrap the image and filename in a div if you want them grouped
        <div>
            <img src={imageUrl} alt={altText} className={className} title={fileName || ''} />
            {showFilename && displayFilename && (
                <p className="text-xs text-gray-600 mt-1 text-center">
                    {displayFilename}
                </p>
            )}
        </div>
    );
};

export default ImageFetcher;