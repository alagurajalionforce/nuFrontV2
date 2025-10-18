import { createSlice } from '@reduxjs/toolkit';

export interface DateState {
    isLoading: boolean;
}

const initialState: DateState = {
    isLoading: false,
};

export const loadingSlice = createSlice({
    name: 'date',
    initialState,
    reducers: {
        startLoading: (state) => {
            state.isLoading = true;
        },
        stopLoading: (state) => {
            state.isLoading = false;
        },
    },
});

export const { startLoading, stopLoading } = loadingSlice.actions;

export default loadingSlice.reducer;
