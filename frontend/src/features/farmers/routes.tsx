import FarmerList from './components/FarmerList';
import FarmerDetails from './components/FarmerDetails';

export const FarmersRoutes = [
  {
    path: '/farmers',
    element: <FarmerList />
  },
  {
    path: '/farmers/:id',
    element: <FarmerDetails />
  }
];
