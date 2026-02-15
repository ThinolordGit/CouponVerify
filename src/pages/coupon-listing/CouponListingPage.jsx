/**
 * src/pages/coupon-listing/CouponListingPage.jsx
 * Display list of all available coupons (public page)
 * Phase 1 - Coupon Listing
 */

import React, { useState, useEffect } from 'react';
import couponService from '../../services/couponService';
import { useTranslation } from '../../context/I18nContext';

export default function CouponListingPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await couponService.getAllCoupons(50, 0);
      setCoupons(data.coupons);
      setError(null);
    } catch (err) {
      console.error('Failed to load coupons:', err);
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading coupons...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">Available Coupons</h1>
        <p className="text-gray-600 mb-12">Choose a coupon type to verify</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              style={{ borderTop: `4px solid ${coupon.theme_color}` }}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{coupon.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {coupon.short_description}
                </p>

                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {coupon.category}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Supported Currencies:</p>
                  <div className="flex flex-wrap gap-2">
                    {coupon.supported_currencies?.map((curr) => (
                      <span
                        key={curr}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {curr}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={`/verification/${coupon.slug}`}
                  className="mt-6 block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Verify Now
                </a>
              </div>
            </div>
          ))}
        </div>

        {coupons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No coupons available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
