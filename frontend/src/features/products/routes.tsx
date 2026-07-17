import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import ProductDetails from './components/ProductDetails';

export const ProductsRoutes = [
  {
    path: '/products',
    element: <ProductList />
  },
  {
    path: '/products/new',
    element: <ProductForm />
  },
  {
    path: '/products/:id/edit',
    element: <ProductForm />
  },
  {
    path: '/products/:id',
    element: <ProductDetails />
  }
];
