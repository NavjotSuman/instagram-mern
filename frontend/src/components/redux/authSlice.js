import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  suggestedUsers:[],
  userProfile:null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
    },
    setSuggestedUser:(state,action)=>{
      state.suggestedUsers = action.payload
    },
    setUserProfile:(state,action)=>{
      state.userProfile = action.payload;
    }
  },
});

export const {setAuthUser, setSuggestedUser, setUserProfile} = authSlice.actions
export default authSlice.reducer