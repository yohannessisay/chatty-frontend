import { ThemeProvider } from "./components/theme-provider";
import { SocketProvider } from "./context/socketContext";
import "./index.css";
import MainLayout from "./layout/mainLayout";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
       <SocketProvider>
      <MainLayout></MainLayout>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
