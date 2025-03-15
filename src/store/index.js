import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

const rootReducer = {
  auth: userReducer,
};

export const store = configureStore({
  reducer: rootReducer,
});
export default store;