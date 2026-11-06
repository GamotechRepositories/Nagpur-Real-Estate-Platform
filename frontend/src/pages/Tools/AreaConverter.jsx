import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, RefreshCw } from 'lucide-react';

const UNIT_FACTORS_TO_SQFT = {
  sqft: 1,
  sqmtr: 10.7639,
  sqyd: 9,
  guntha: 1089,
  acre: 43560,
  hectare: 107639,
};

const UNIT_LABELS = {
  sqft: 'Square Feet (Sq.Ft)',
  sqmtr: 'Square Metre (Sq.M)',
  sqyd: 'Square Yard / Gaj (Sq.Yd)',
  guntha: 'Guntha (Nagpur Standard)',
  acre: 'Acre',
  hectare: 'Hectare',
};

const AreaConverterPage = () => {
  const [value, setValue] = useState(1000);
  const [fromUnit, setFromUnit] = useState('sqft');
  const [toUnit, setToUnit] = useState('sqmtr');

  // Direct calculation
  const totalSqFt = (Number(value) || 0) * (UNIT_FACTORS_TO_SQFT[fromUnit] || 1);
  const convertedValue = (totalSqFt / (UNIT_FACTORS_TO_SQFT[toUnit] || 1)).toFixed(2);

  return (
    <>
      <Helmet>
        <title>Area Converter | Nagpur Realty</title>
        <meta
          name="description"
          content="Convert land and flat area units easily: Square Feet to Square Metres, Guntha, Gaj, Acres, and Hectares for Nagpur real estate."
        />
      </Helmet>

      <div className="bg-[#F7F4ED] min-h-screen py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header matching Screen 13 */}
          <div className="space-y-1.5 border-b border-[#E9E4DA] pb-6 text-center sm:text-left">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#172C3B]">
              Area Converter
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Quickly convert land and property measurements across Nagpur standards.
            </p>
          </div>

          {/* Converter Card matching Screen 13 */}
          <div className="bg-white rounded-2xl border border-[#E9E4DA] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* From Unit */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  From Unit
                </label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                >
                  {Object.entries(UNIT_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder="1000"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                />
              </div>

              {/* To Unit */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  To Unit
                </label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B89A65]"
                >
                  {Object.entries(UNIT_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Converted Area Result Box matching Screen 13 */}
            <div className="bg-[#F7F4ED] rounded-xl p-6 border border-[#B89A65]/30 text-center space-y-1">
              <span className="text-xs text-gray-500 font-medium">Converted Area</span>
              <div className="text-3xl sm:text-4xl font-bold text-[#172C3B]">
                {convertedValue}{' '}
                <span className="text-lg font-semibold text-[#B89A65]">
                  {toUnit === 'sqft'
                    ? 'Sq.Ft.'
                    : toUnit === 'sqmtr'
                    ? 'Sq.M.'
                    : toUnit === 'sqyd'
                    ? 'Sq.Yd.'
                    : toUnit === 'guntha'
                    ? 'Guntha'
                    : toUnit === 'acre'
                    ? 'Acres'
                    : 'Hectares'}
                </span>
              </div>
            </div>

            {/* Quick conversion guide */}
            <div className="pt-2 text-xs text-gray-500 space-y-1 border-t border-gray-100">
              <p className="font-semibold text-gray-700">Nagpur Land Reference Key:</p>
              <p>• 1 Guntha = 1,089 Square Feet (approx. 101.17 Sq.M.)</p>
              <p>• 1 Acre = 40 Gunthas (43,560 Square Feet)</p>
              <p>• 1 Square Metre = 10.764 Square Feet</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AreaConverterPage;
