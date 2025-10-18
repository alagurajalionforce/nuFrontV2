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

const ImageFetcher: React.FC<ImageFetcherProps> = ({ fileName, altText, className, fallbackText }) => {

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

    // Explicitly define the return type for the async function inside useCallback
    const fetchImage = useCallback(async (): Promise<string | null> => { // <-- Changed here
        //console.log(roleSideBar?.token, 'loginDetails for fetch');

        if (!fileName || !roleSideBar?.token) {
            setLoading(false);
            setImageUrl(null);
            setError(false);
            if (!roleSideBar?.token && fileName) {
                console.warn("No authentication token available to fetch image.");
                setError(true);
            }
            return null; // <-- Explicitly return null here
        }

        setLoading(true);
        setError(false);
        let currentObjectUrl: string | null = null;

        try {
            const apiUrl = baseUrl + `app/file?fileName=${fileName}`;
            const headers: RequestHeader = {
                'Authorization': `Bearer ${roleSideBar.token}`,
            };

            const response = await axios.get(apiUrl, {
                headers: headers,
                responseType: 'arraybuffer'
            });

            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const imageBlob = new Blob([response.data], { type: response.headers['content-type'] });
            currentObjectUrl = URL.createObjectURL(imageBlob);
            setImageUrl(currentObjectUrl);

        } catch (err) {
            console.error("Failed to fetch image:", err);
            setError(true);
            setImageUrl(null);
            currentObjectUrl = null; // Ensure it's null on error
        } finally {
            setLoading(false);
        }
        return currentObjectUrl;
    }, [fileName, roleSideBar.token]);

    useEffect(() => {
        let cleanupUrl: string | null = null;
        fetchImage().then(url => {
            cleanupUrl = url; // Now 'url' will be 'string | null', so assignment is valid
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

    return <img src={imageUrl} alt={altText} className={className} />;
};

export default ImageFetcher;