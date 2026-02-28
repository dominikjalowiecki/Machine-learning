import { useState } from 'react';
import DiabetesForm from './components/DiabetesForm';
import PredictionResult from './components/PredictionResult';
import DataVisualization from './components/DataVisualization';

function App() {
  const [formData, setFormData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePrediction = (data, result) => {
    setFormData(data);
    setPrediction(result);
  };

  const handleReset = () => {
    setFormData(null);
    setPrediction(null);
  };

  return (
    <div className='min-h-screen py-8 px-4 bg-gray-50'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 mb-3'>
            Predykcja cukrzycy na podstawie danych medycznych pacjenta
          </h1>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <DiabetesForm
              onPrediction={handlePrediction}
              onReset={handleReset}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
          <div className='space-y-6'>
            {prediction && (
              <>
                <PredictionResult prediction={prediction} formData={formData} />
                <DataVisualization formData={formData} />
              </>
            )}
            {!prediction && (
              <div className='rounded-sm shadow-md bg-white p-6 text-center py-10'>
                <h3 className='text-lg font-semibold text-gray-700'>
                  Wypełnij formularz, aby uzyskać predykcję
                </h3>
              </div>
            )}
          </div>
        </div>
        <div className='mt-8 text-center text-gray-500 text-sm'>
          <a
            href='https://github.com/dominikjalowiecki'
            target='_blank'
            rel='noopener noreferrer'
          >
            Dominik Jałowiecki &copy; 2026
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
