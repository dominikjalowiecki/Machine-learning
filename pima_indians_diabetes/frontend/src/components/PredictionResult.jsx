function PredictionResult({ prediction, formData }) {
  if (!prediction) return null;

  const isDiabetic = prediction.prediction === 1;
  const probability = (prediction.probability * 100).toFixed(1);

  const getRiskLevel = (prob) => {
    if (prob > 0.7) return { level: 'Wysokie', color: 'red' };
    if (prob > 0.5) return { level: 'Podwyższone', color: 'orange' };
    if (prob > 0.3) return { level: 'Umiarkowane', color: 'yellow' };
    return { level: 'Niskie', color: 'green' };
  };

  const risk = getRiskLevel(prediction.probability);

  return (
    <div className='space-y-6'>
      <div
        className={`rounded-sm shadow-md bg-white p-6 ${
          isDiabetic ? 'border-2 border-red-300' : 'border-2 border-green-300'
        }`}
      >
        <div className='text-center'>
          <h2 className='text-3xl font-bold mb-2'>
            {isDiabetic ? (
              <span className='text-red-600'>Ryzyko cukrzycy</span>
            ) : (
              <span className='text-green-600'>Brak ryzyka</span>
            )}
          </h2>
          <div className='bg-gray-50 rounded-lg p-6 mb-4'>
            <div className='text-sm text-gray-600 mb-2'>Prawdopodobieństwo</div>
            <div className='text-3xl font-bold text-gray-800 mb-3'>
              {probability}%
            </div>
            <div className='w-full bg-gray-200 rounded-full h-4 overflow-hidden'>
              <div
                className={`h-full transition-all duration-1000 ease-out ${
                  prediction.probability > 0.7
                    ? 'bg-red-500'
                    : prediction.probability > 0.5
                      ? 'bg-orange-500'
                      : prediction.probability > 0.3
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                }`}
                style={{ width: `${probability}%` }}
              />
            </div>
          </div>
          <div
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full text-lg font-semibold
            ${risk.color === 'red' ? 'bg-red-100 text-red-700' : ''}
            ${risk.color === 'orange' ? 'bg-orange-100 text-orange-700' : ''}
            ${risk.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${risk.color === 'green' ? 'bg-green-100 text-green-700' : ''}
          `}
          >
            <span>Ryzyko: {risk.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionResult;
