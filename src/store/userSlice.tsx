import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface DateState {
    token: string;
    username: string;
    userId: string;
    roles: string;
    logo: any;
}

const initialState: DateState = {
    token: '',
    username: '',
    userId: '',
    roles: '',
    logo: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        authSuccessful: (
            state,
            action: PayloadAction<{
                token: string;
                username: string;
                userId: string;
                roles: string;
            }>
        ) => {
            state.token = action.payload.token;
            state.username = action.payload.username;
            state.userId = action.payload.userId;
            state.roles = action.payload.roles;
        },

        logoutUser: (state) => {
            state.token = '';
            state.username = '';
            state.userId = '';
            state.roles = '';
            state.logo = null; // Optionally reset logo on logout
        },

        userProfileImage: (
            state,
            action: PayloadAction<{ logo: any }> // Add the payload type for logo
        ) => {
            state.logo = action.payload.logo;
        },
    },
});

export const { authSuccessful, logoutUser, userProfileImage } = userSlice.actions;

export default userSlice.reducer;
