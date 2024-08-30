import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  suggestedUsers:[],
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
    }
  },
});

export const {setAuthUser, setSuggestedUser} = authSlice.actions
export default authSlice.reducer