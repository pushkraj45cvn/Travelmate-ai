import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  isDarkMode: localStorage.getItem('theme') === 'dark',
  modalOpen: false,
  modalType: null,
  modalData: null,
  searchQuery: '',
  activeTab: 'overview',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    openModal: (state, action) => {
      state.modalOpen = true;
      state.modalType = action.payload.type;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalType = null;
      state.modalData = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  openModal,
  closeModal,
  setSearchQuery,
  setActiveTab,
} = uiSlice.actions;

export default uiSlice.reducer;
