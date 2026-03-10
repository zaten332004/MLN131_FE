import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatBot } from "./components/ChatBot";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ChatBot />
    </AuthProvider>
  );
}
