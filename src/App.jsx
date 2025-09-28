import { Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router} from 'react-router-dom';
import Header from './pages/Header';
import Sidebar from './pages/Sidebar';
import POSDashboard from './pages/Posdashboard';
import StaffDashboard from './pages/core/StaffDashboard';
import ProductsPage from './pages/ProductsPage';
import ReportPage from './pages/ReportPage';
import InventoryPage from './pages/inventory/InventoryPage';
import Users from './pages/Users';
import Profile from './pages/Profile';
import BusinessSettingsPage from './pages/Settings';
import UDashboard from './pages/core/UDashBoard';
import AddProductPage from './pages/AddProduct'; 
import AddItem from './pages/inventory/AddInventory';
import InstallPrompt from './pages/InstallPrompt';
import usePWAInstall from './hooks/usePWAInstall';
import Login from './pages/Login';
import Logout from './pages/Logout';
import AddUser from './pages/core/AddUser';
import InventoryUpdate from './pages/inventory/InventoryUpdate';
import AddBranch from './pages/AddBranch';
import Employee from './pages/Employee';


// Placeholder components for routes
function EmployeeRoute(){
  return(
    <Employee />
  )
}
function AddBranchRoute(){
  return(
    <AddBranch />
  )
}
function InventoryUpdateRoute() {
  return (
    <InventoryUpdate />
  );
}
function AddUserRiute(){
  return(
    <AddUser />
  )
}
function LogoutRoute(){
  return(
    <Logout />
  )
}
function LoginRoute(){
  return(
    <Login />
  )
}
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
function BusinessSettingsPageRoute() {
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
        <main className="p-1 md:ml-64"> {/* Offset for sidebar width */}
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/point-of-sale" element={<PointOfSale />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/products" element={< Products />} />
            <Route path="/logout" element={<LogoutRoute />} />
            <Route path="/users" element={<Users />} />
            <Route path="/my_profile" element={<Profile />} />
            <Route path="/settings" element={<BusinessSettingsPage />} />
            <Route path= "staff_dashboard" element={<UDashboard />} />
            <Route path="/add_product" element={<AddingProducts />} />
            <Route path='/add_inventory' element={<AddingInventory />} />
            <Route path='/add_user' element={<AddUserRiute />} />
            <Route path='/update_inventory' element={<InventoryUpdateRoute />} />
            <Route path='/add_branch' element={<AddBranchRoute />} />
            <Route path= '/employee' elememt={<EmployeeRoute/>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;