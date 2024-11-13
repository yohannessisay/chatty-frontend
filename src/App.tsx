import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./context/authContext";
import { SocketProvider } from "./context/socketContext";
import "./index.css";
import MainLayout from "./layout/mainLayout";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <AuthProvider>
        <SocketProvider>
          <MainLayout></MainLayout>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
