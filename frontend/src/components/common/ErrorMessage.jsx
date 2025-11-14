import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export const ErrorMessage = ({ error, retry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <ErrorOutlineIcon className="text-danger-500 text-6xl mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
