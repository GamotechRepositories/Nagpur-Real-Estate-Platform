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
        <title>Maharashtra Land & Area Unit Converter | Nagpur Estates</title>
        <meta
          name="description"
          content="Accurate land and plot dimension conversions for Nagpur & Maharashtra: Square Feet, Guntha, Gaj, Acres, and Hectares."
        />
      </Helmet>

      <div className="bg-ivory-light min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto border-b border-beige pb-6">
            <span className="text-[10px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-3 py-1 bg-white mb-3 inline-block">
              Vidarbha Land Measurement
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
              Property Area Converter
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 font-sans leading-relaxed">
              Standardized dimensional translations across Maharashtra revenue units including Guntha, Gaj, Sq.Ft, and Acres.
            </p>
          </div>

          {/* Interactive Converter Card */}
          <div className="bg-white p-8 sm:p-10 border border-beige shadow-subtle">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                  Enter Land Magnitude
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleConvert(e.target.value, unit)}
                  className="w-full px-4 py-3 border border-beige bg-ivory-light text-navy text-sm font-semibold focus:outline-none focus:border-gold transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                  Source Measurement Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => handleConvert(value, e.target.value)}
                  className="w-full px-4 py-3 border border-beige bg-ivory-light text-navy text-sm font-medium focus:outline-none focus:border-gold transition-colors font-sans"
                >
                  <option value="sqft">Square Feet (Sq.Ft)</option>
                  <option value="guntha">Guntha (1 Guntha = 1,089 Sq.Ft)</option>
                  <option value="sqyd">Square Yard / Gaj (Sq.Yd)</option>
                  <option value="sqmtr">Square Meter (Sq.Mtr)</option>
                  <option value="acre">Acre (40 Gunthas)</option>
                  <option value="hectare">Hectare (2.471 Acres)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-beige">
              <div className="bg-ivory-light p-4 border border-beige">
                <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Square Feet</span>
                <strong className="text-lg font-semibold text-navy font-sans">{results.sqFt}</strong>
                <span className="text-[10px] text-charcoal-muted block mt-0.5">sq.ft</span>
              </div>

              <div className="bg-ivory-light p-4 border border-beige">
                <span className="text-[10px] uppercase tracking-luxury text-gold block mb-1">Maharashtra Guntha</span>
                <strong className="text-lg font-semibold text-navy font-sans">{results.guntha}</strong>
                <span className="text-[10px] text-charcoal-muted block mt-0.5">Gunthas</span>
              </div>

              <div className="bg-ivory-light p-4 border border-beige">
                <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Square Yards (Gaj)</span>
                <strong className="text-lg font-semibold text-navy font-sans">{results.sqYd}</strong>
                <span className="text-[10px] text-charcoal-muted block mt-0.5">sq.yd</span>
              </div>

              <div className="bg-ivory-light p-4 border border-beige">
                <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Square Meters</span>
                <strong className="text-lg font-semibold text-navy font-sans">{results.sqMtr}</strong>
                <span className="text-[10px] text-charcoal-muted block mt-0.5">sq.m</span>
              </div>

              <div className="bg-ivory-light p-4 border border-beige">
                <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Acre</span>
                <strong className="text-lg font-semibold text-navy font-sans">{results.acre}</strong>
                <span className="text-[10px] text-charcoal-muted block mt-0.5">Acres</span>
              </div>

              <div className="bg-ivory-light p-4 border border-beige">
                <span className="text-[10px] uppercase tracking-luxury text-charcoal-muted block mb-1">Hectare</span>
                <strong className="text-lg font-semibold text-navy font-sans">{results.hectare}</strong>
                <span className="text-[10px] text-charcoal-muted block mt-0.5">Hectares</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AreaConverterPage;
