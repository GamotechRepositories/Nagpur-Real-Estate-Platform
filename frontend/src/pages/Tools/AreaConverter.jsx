import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Square, ArrowRight, RefreshCw } from 'lucide-react';
import apiClient from '../../api/client';

const AreaConverterPage = () => {
  const [value, setValue] = useState(1500);
  const [unit, setUnit] = useState('sqft');
  const [results, setResults] = useState({
    sqFt: 1500,
    sqMtr: 139.35,
    sqYd: 166.67,
    guntha: 1.377,
    acre: 0.0344,
    hectare: 0.0139,
  });

  const handleConvert = async (val, fromUnit) => {
    setValue(val);
    setUnit(fromUnit);
    if (!val || val <= 0) return;

    try {
      const res = await apiClient.post('/tools/area-convert', {
        value: Number(val),
        fromUnit,
      });
      if (res.data?.data?.conversions) {
        setResults(res.data.data.conversions);
      }
    } catch (e) {
      // Offline fallback calculation
      const factors = { sqft: 1, sqmtr: 10.7639, sqyd: 9, guntha: 1089, acre: 43560, hectare: 107639 };
      const totalSqFt = val * (factors[fromUnit] || 1);
      setResults({
        sqFt: parseFloat(totalSqFt.toFixed(2)),
        sqMtr: parseFloat((totalSqFt / 10.7639).toFixed(2)),
        sqYd: parseFloat((totalSqFt / 9).toFixed(2)),
        guntha: parseFloat((totalSqFt / 1089).toFixed(3)),
        acre: parseFloat((totalSqFt / 43560).toFixed(4)),
        hectare: parseFloat((totalSqFt / 107639).toFixed(4)),
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Nagpur Real Estate Area Converter — Sq Ft, Guntha, Acre, Gaj</title>
        <meta name="description" content="Accurate land and property area unit converter for Nagpur & Maharashtra. Convert square feet, guntha, square yards, acres and hectares." />
      </Helmet>

      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Maharashtra Real Estate
            </span>
            <h1 className="text-3xl font-black text-brand-navy mt-1">
              Property Area Converter
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Convert land and plot areas instantly between Square Feet, Guntha, Gaj, Acres, and Hectares
            </p>
          </div>

          {/* Interactive Converter Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Enter Area Value
                </label>
                <input
                  type="number"
                  min={1}
                  value={value}
                  onChange={(e) => handleConvert(Number(e.target.value), unit)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-lg font-black text-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Select Input Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => handleConvert(value, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm font-bold text-slate-800 bg-white"
                >
                  <option value="sqft">Square Feet (Sq.Ft)</option>
                  <option value="guntha">Guntha (Nagpur Standard: 1,089 Sq.Ft)</option>
                  <option value="sqyd">Square Yard / Gaj (9 Sq.Ft)</option>
                  <option value="sqmtr">Square Metre (Sq.Mtr)</option>
                  <option value="acre">Acre (43,560 Sq.Ft)</option>
                  <option value="hectare">Hectare (1,07,639 Sq.Ft)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Square Feet</span>
                <div className="text-xl font-black text-brand-navy mt-1">{results.sqFt?.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500">Standard residential unit</span>
              </div>

              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200">
                <span className="text-[11px] text-brand-orange font-bold uppercase block">Guntha (गुंठा)</span>
                <div className="text-xl font-black text-brand-orange mt-1">{results.guntha}</div>
                <span className="text-[10px] text-orange-700">1 Guntha = 1,089 Sq.Ft</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Square Yard / Gaj</span>
                <div className="text-xl font-black text-brand-navy mt-1">{results.sqYd?.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500">1 Gaj = 9 Sq.Ft</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Square Metre</span>
                <div className="text-xl font-black text-brand-navy mt-1">{results.sqMtr?.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500">Metric standard</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Acre (एकड़)</span>
                <div className="text-xl font-black text-brand-navy mt-1">{results.acre}</div>
                <span className="text-[10px] text-slate-500">1 Acre = 40 Gunthas</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Hectare (हेक्टर)</span>
                <div className="text-xl font-black text-brand-navy mt-1">{results.hectare}</div>
                <span className="text-[10px] text-slate-500">1 Hectare = 2.47 Acres</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AreaConverterPage;
