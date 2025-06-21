import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
  name: "auth",
  initialState: {
    userCurr: null,
    token: null
  },
  reducers: {
    login: (state, action) => {
      console.log('store', action)
      state.userCurr = action.payload.data;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.userCurr = null;
      state.token = null;
    }
  },
});


export const { login, logout } = userSlice.actions;
export default userSlice.reducer;