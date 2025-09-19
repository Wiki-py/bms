import { Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router} from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import POSDashboard from './components/Posdashboard';
import StaffDashboard from './components/StaffDashboard';
import ProductsPage from './components/ProductsPage';
import ReportPage from './components/ReportPage';
import InventoryPage from './components/InventoryPage';
import Users from './components/Users';
import Profile from './components/Profile';
import Settings from './components/Settings';
import UDashboard from './components/UDashBoard';
import AddProductPage from './components/AddProduct'; 
import AddItem from './components/AddInventory';
import InstallPrompt from './components/InstallPrompt';
import usePWAInstall from './hooks/usePWAInstall';
// Placeholder components for routes
function AddingInventory() {
  return (
    <AddItem />
  );
}
function AddingProducts() {
  return (
    <AddProductPage />
  );
}
function Dashboard() {
  return (
      <StaffDashboard /> 
  );
}
function UserDashboard() {
  return (
      <UserDashboard /> 
  );
}
function Inventory() {
  return ( <Inventory />);
}
function Finance() {
  return <h2 className="text-2xl p-4">Finance Page</h2>;
}
function PointOfSale() {
  return (
    <POSDashboard />
  );
}
function Products() {
  return (
    <ProductsPage />
  );
}
function Reports() {
  return (
    <ReportPage />
  );
}
function Logout() {
  return <h2 className="text-2xl p-4">Logged Out</h2>;
}
function BusinessSettingsPage() {
  return (
    <Settings />
  )
}

function App() {
  const user = { name: 'John Doe' }; // Mock user data
  const { canInstall, promptInstall } = usePWAInstall();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="min-h-screen bg-gray-100">
     
      <InstallPrompt canInstall={canInstall} promptInstall={promptInstall} />
    </div>
      <Sidebar />
  

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="p-4 md:ml-64"> {/* Offset for sidebar width */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/point-of-sale" element={<PointOfSale />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/products" element={< Products />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/users" element={<Users />} />
            <Route path="/my_profile" element={<Profile />} />
            <Route path="/business_settings" element={<BusinessSettingsPage />} />
            <Route path= "staff_dashboard" element={<UDashboard />} />
            <Route path="/add_product" element={<AddingProducts />} />
            <Route path='/add_inventory' element={<AddingInventory />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;