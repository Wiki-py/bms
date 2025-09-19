import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const productsData = [
  { id: 1, name: 'Product A', cost_price: 29.99, selling_price: 29.99, profits: 4.99, stock: 150, category: 'Electronics', image: 'https://picsum.photos/200/300?random=1' },
  { id: 2, name: 'Product B', cost_price: 49.99, selling_price: 29.99, profits: 4.99, stock: 80, category: 'Clothing', image: 'https://picsum.photos/200/300?random=2' },
  { id: 3, name: 'Product C', cost_price: 19.99, selling_price: 29.99, profits: 4.99, stock: 200, category: 'Books', image: 'https://picsum.photos/200/300?random=3' },
  { id: 4, name: 'Product D', cost_price: 99.99, selling_price: 29.99, profits: 4.99, stock: 50, category: 'Home Appliances', image: 'https://picsum.photos/200/300?random=4' },
  // Add more products as needed
];

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = productsData.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">Product Inventory</h1>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-300 shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hidden md:table-header-group">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold">SKU</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Image</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Category</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Stock</th>  
              <th className="py-3 px-4 text-left text-sm font-semibold">Cost Price</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Selling Price</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Profits</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  No products found matching your search.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className={`block md:table-row ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} md:bg-transparent hover:bg-gray-100 md:hover:bg-gray-100`}
                >
                  <td
                    className="block md:table-cell py-2 px-4 text-sm text-gray-900 before:content-['ID:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="ID"
                  >
                    {product.id}
                  </td>
                  <td
                    className="block md:table-cell py-2 px-4 text-sm text-gray-900 before:content-['Image:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Image"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md mx-auto md:mx-0"
                    />
                  </td>
                  <td
                    className="block md:table-cell py-2 px-4 text-sm text-gray-900 before:content-['Name:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Name"
                  >
                    {product.name}
                  </td>
                   <td
                    className="block md:table-cell py-2 px-4 text-sm text-gray-900 before:content-['Category:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Category"
                  >
                    {product.category}
                  </td>
                  <td
                    className="block md:table-cell py-2 px-4 text-sm text-gray-900 before:content-['Stock:'] before:font-bold before:mr-2 md:before:content-none bg-green-300"
                    data-label="Stock"
                  >
                    {product.stock}
                  </td>

                  {/* product cost price, selling price and profits */}
                  <td
                    className="block md:table-cell py-2 px-4 text-sm text-gray-900 before:content-['Price:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Price"
                  >
                    ${product.cost_price.toFixed(2)}
                  </td>
                  <td
                    className="block md:table-cell py-2 px-4 text-sm text-gray-900 before:content-['Price:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Price"
                  >
                    ${product.selling_price.toFixed(2)}
                  </td>
                  <td
                    className="block md:table-cell py-2 px-4 text-sm text-gray-900 before:content-['Price:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Price"
                  >
                    ${product.profits.toFixed(2)}
                  </td>
                  <td
                    className="block md:table-cell py-2 px-4 text-sm before:content-['Actions:'] before:font-bold before:mr-2 md:before:content-none"
                    data-label="Actions"
                  >
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs md:text-sm w-full md:w-auto">
                        View
                      </button>
                      <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs md:text-sm w-full md:w-auto">
                        Edit
                      </button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs md:text-sm w-full md:w-auto">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-center md:justify-end">
        <button onClick={() =>navigate('/add_product')} className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 shadow-md w-full md:w-auto">
          Add New Product
        </button>
      </div>
    </div>
  );
};

export default Products;