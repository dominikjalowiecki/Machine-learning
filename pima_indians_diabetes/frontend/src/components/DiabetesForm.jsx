import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const FAMILY_HISTORY_OPTIONS = [
  {
    value: 0.16,
    label: 'Niska predyspozycja rodzinna',
    description: 'Brak lub dalecy krewni',
  },
  {
    value: 0.34,
    label: 'Przeciętna predyspozycja',
    description: 'Standardowe ryzyko genetyczne',
  },
  {
    value: 0.5,
    label: 'Podwyższona predyspozycja',
    description: 'Pojedynczy krewny',
  },
  {
    value: 0.8,
    label: 'Wysoka predyspozycja',
    description: 'Wielokrotne przypadki w rodzinie',
  },
  {
    value: 1.2,
    label: 'Bardzo wysoka predyspozycja',
    description: 'Ekstremalna historia rodzinna',
  },
];

const SKIN_THICKNESS_OPTIONS = [
  {
    value: 15,
    label: 'Cienki (15 mm)',
    description: 'Niska wartość',
  },
  {
    value: 27,
    label: 'Przeciętny (27 mm)',
    description: 'Typowa wartość',
  },
  { value: 35, label: 'Podwyższony (35 mm)', description: 'Powyżej mediany' },
  {
    value: 41,
    label: 'Gruby (41 mm)',
    description: 'Wysoka wartość',
  },
  {
    value: 50,
    label: 'Bardzo gruby (50 mm)',
    description: 'Ekstremalna wartość',
  },
];

const BMI_CATEGORIES = {
  underweight: {
    min: 0,
    max: 18.5,
    label: 'Niedowaga',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  normal: {
    min: 18.5,
    max: 25,
    label: 'Prawidłowa waga',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  overweight: {
    min: 25,
    max: 30,
    label: 'Nadwaga',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  obese: {
    min: 30,
    max: 100,
    label: 'Otyłość',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return BMI_CATEGORIES.underweight;
  if (bmi < 25) return BMI_CATEGORIES.normal;
  if (bmi < 30) return BMI_CATEGORIES.overweight;
  return BMI_CATEGORIES.obese;
};

function DiabetesForm({ onPrediction, onReset, loading, setLoading }) {
  const initialBmiCalculator = useMemo(() => ({ height: 170, weight: 70 }), []);
  const [bmiCalculator, setBmiCalculator] = useState(initialBmiCalculator);

  const initialFormData = useMemo(() => {
    const heightInMeters = bmiCalculator.height / 100;
    const calculatedBMI =
      bmiCalculator.weight / (heightInMeters * heightInMeters);
    const roundedBMI = Math.round(calculatedBMI * 10) / 10;

    return {
      Pregnancies: 0,
      Glucose: 120,
      BloodPressure: 70,
      SkinThickness: 27,
      Insulin: 80,
      BMI: roundedBMI,
      DiabetesPedigreeFunction: 0.34,
      Age: 30,
    };
  }, []);
  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});
  const [bmiCategory, setBmiCategory] = useState(null);

  const validateField = (name, value) => {
    const validations = {
      Pregnancies: { min: 0, max: 20, label: 'Liczba ciąż' },
      Glucose: { min: 0.1, max: 250, label: 'Glukoza' },
      BloodPressure: { min: 0.1, max: 200, label: 'Ciśnienie krwi' },
      SkinThickness: { min: 0, max: 100, label: 'Grubość fałdu skórnego' },
      Insulin: { min: 0, max: 900, label: 'Insulina' },
      BMI: { min: 0.1, max: 70, label: 'BMI' },
      DiabetesPedigreeFunction: {
        min: 0.01,
        max: 3,
        label: 'Funkcja rodowodu',
      },
      Age: { min: 18, max: 99, label: 'Wiek' },
    };

    const validation = validations[name];
    if (!validation) return '';

    if (value < validation.min || value > validation.max) {
      return `${validation.label} musi być między ${validation.min}, a ${validation.max}`;
    }

    return '';
  };

  useEffect(() => {
    if (bmiCalculator.height > 0 && bmiCalculator.weight > 0) {
      const heightInMeters = bmiCalculator.height / 100;
      const calculatedBMI =
        bmiCalculator.weight / (heightInMeters * heightInMeters);
      const roundedBMI = Math.round(calculatedBMI * 10) / 10;

      setFormData((prev) => ({ ...prev, BMI: roundedBMI }));
    }
  }, [bmiCalculator.height, bmiCalculator.weight]);

  useEffect(() => {
    if (formData.BMI > 0) {
      setBmiCategory(getBMICategory(formData.BMI));
    }
  }, [formData.BMI]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let numValue =
      name === 'DiabetesPedigreeFunction' ||
      name === 'SkinThickness' ||
      name === 'Age' ||
      name === 'Pregnancies'
        ? parseFloat(value)
        : parseFloat(value) || 0;

    if (isNaN(numValue)) {
      numValue = 0;
    }

    setFormData((prev) => ({ ...prev, [name]: numValue }));

    const error = validateField(name, numValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBMICalculatorChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setBmiCalculator((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/predict`, formData);
      onPrediction(formData, response.data);
    } catch (error) {
      console.error('Błąd predykcji:', error);
      alert('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    onReset();
  };

  return (
    <div className='rounded-sm shadow-md bg-white p-6'>
      <p className='text-sm text-gray-900 mb-3'>
        Dane:{' '}
        <a
          className='text-blue-600 underline'
          href='https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database'
          target='_blank'
          rel='noopener noreferrer'
        >
          Pima Indians Diabetes
        </a>{' '}
        | Model: k-NN
      </p>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>Dane pacjenta</h2>
      <div className='mb-6 p-4 bg-blue-50 rounded-sm border-2 border-blue-200'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-lg font-semibold text-blue-800'>
            Kalkulator BMI
          </h3>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='label text-xs'>Wzrost (cm)</label>
            <input
              type='number'
              name='height'
              value={bmiCalculator.height}
              onChange={handleBMICalculatorChange}
              className='input-field text-sm'
            />
          </div>
          <div>
            <label className='label text-xs'>Waga (kg)</label>
            <input
              type='number'
              name='weight'
              value={bmiCalculator.weight}
              onChange={handleBMICalculatorChange}
              className='input-field text-sm'
            />
          </div>
        </div>
        {bmiCategory && (
          <div className={`mt-3 p-3 rounded-lg ${bmiCategory.bgColor}`}>
            <div className='flex items-center justify-between'>
              <span className={`font-semibold ${bmiCategory.color}`}>
                {bmiCategory.label}
              </span>
              <span className={`text-sm ${bmiCategory.color}`}>
                BMI: {formData.BMI.toFixed(1)}
              </span>
            </div>
            <div className='mt-2 text-xs text-gray-600'>
              Klasyfikacja WHO: {bmiCategory.min} -{' '}
              {bmiCategory.max === 100 ? '∞' : bmiCategory.max}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='label'>Liczba ciąż (0-20)</label>
          <input
            type='number'
            name='Pregnancies'
            value={formData.Pregnancies}
            onChange={handleInputChange}
            className={`input-field ${
              errors.Pregnancies ? 'border-red-500' : ''
            }`}
          />
          {errors.Pregnancies && (
            <p className='text-red-500 text-xs mt-1'>{errors.Pregnancies}</p>
          )}
        </div>
        <div>
          <label className='label'>Glukoza (mg/dL, 1-250)</label>
          <input
            type='number'
            name='Glucose'
            step='0.1'
            value={formData.Glucose}
            onChange={handleInputChange}
            className={`input-field ${errors.Glucose ? 'border-red-500' : ''}`}
          />
          {errors.Glucose && (
            <p className='text-red-500 text-xs mt-1'>{errors.Glucose}</p>
          )}
        </div>
        <div>
          <label className='label'>Ciśnienie krwi (mm Hg, 1-200)</label>
          <input
            type='number'
            name='BloodPressure'
            step='0.1'
            value={formData.BloodPressure}
            onChange={handleInputChange}
            className={`input-field ${
              errors.BloodPressure ? 'border-red-500' : ''
            }`}
          />
          {errors.BloodPressure && (
            <p className='text-red-500 text-xs mt-1'>{errors.BloodPressure}</p>
          )}
        </div>
        <div>
          <label className='label'>Grubość fałdu skórnego</label>
          <select
            name='SkinThickness'
            value={formData.SkinThickness}
            onChange={handleInputChange}
            className={`input-field ${
              errors.SkinThickness ? 'border-red-500' : ''
            }`}
          >
            {SKIN_THICKNESS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className='text-xs text-gray-500 mt-1'>
            {
              SKIN_THICKNESS_OPTIONS.find(
                (opt) => opt.value === formData.SkinThickness,
              )?.description
            }
          </p>
          {errors.SkinThickness && (
            <p className='text-red-500 text-xs mt-1'>{errors.SkinThickness}</p>
          )}
        </div>
        <div>
          <label className='label'>Insulina (μU/mL, 0-900)</label>
          <input
            type='number'
            name='Insulin'
            step='0.1'
            value={formData.Insulin}
            onChange={handleInputChange}
            className={`input-field ${errors.Insulin ? 'border-red-500' : ''}`}
          />
          {errors.Insulin && (
            <p className='text-red-500 text-xs mt-1'>{errors.Insulin}</p>
          )}
        </div>
        <div>
          <label className='label'>BMI (kg/m², 0.1-70)</label>
          <input
            type='number'
            name='BMI'
            step='0.1'
            value={formData.BMI}
            onChange={handleInputChange}
            className={`input-field ${errors.BMI ? 'border-red-500' : ''}`}
            placeholder='Oblicza się automatycznie lub wpisz ręcznie'
          />
          {errors.BMI && (
            <p className='text-red-500 text-xs mt-1'>{errors.BMI}</p>
          )}
        </div>
        <div>
          <label className='label'>Historia rodzinna cukrzycy</label>
          <select
            name='DiabetesPedigreeFunction'
            value={formData.DiabetesPedigreeFunction}
            onChange={handleInputChange}
            className={`input-field ${
              errors.DiabetesPedigreeFunction ? 'border-red-500' : ''
            }`}
          >
            {FAMILY_HISTORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className='text-xs text-gray-500 mt-1'>
            {
              FAMILY_HISTORY_OPTIONS.find(
                (opt) => opt.value === formData.DiabetesPedigreeFunction,
              )?.description
            }
          </p>
          {errors.DiabetesPedigreeFunction && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.DiabetesPedigreeFunction}
            </p>
          )}
        </div>
        <div>
          <label className='label'>Wiek (lat, 18-99)</label>
          <input
            type='number'
            name='Age'
            value={formData.Age}
            onChange={handleInputChange}
            className={`input-field ${errors.Age ? 'border-red-500' : ''}`}
          />
          {errors.Age && (
            <p className='text-red-500 text-xs mt-1'>{errors.Age}</p>
          )}
        </div>
        <div className='flex space-x-3 pt-4'>
          <button
            type='submit'
            disabled={loading || Object.keys(errors).some((key) => errors[key])}
            className='btn-primary flex-1 flex items-center justify-center space-x-2'
          >
            {loading ? (
              <>
                <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                <span>Analizuję...</span>
              </>
            ) : (
              <span>Wykonaj predykcję</span>
            )}
          </button>
          <button
            type='button'
            onClick={handleResetForm}
            className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all'
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default DiabetesForm;
