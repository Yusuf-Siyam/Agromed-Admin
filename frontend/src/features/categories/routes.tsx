import CategoryList from './components/CategoryList';
import TranslationReview from './components/TranslationReview';

export const CategoriesRoutes = [
  {
    path: '/categories',
    element: <CategoryList />
  },
  {
    path: '/categories/translations',
    element: <TranslationReview />
  }
];
