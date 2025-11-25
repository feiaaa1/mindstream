import { create } from "zustand";

interface UserState {
	name: string;
	setName: (name: string) => void;
	isAuthenticated: boolean;
	setAuthStatus: (status: boolean) => void;
}

const useUserStore = create<UserState>((set) => ({
	name: "John",
	setName: (name: string) => set({ name }),
	isAuthenticated: false,
	setAuthStatus: (status: boolean) => set({ isAuthenticated: status }),
}));

export default useUserStore;
