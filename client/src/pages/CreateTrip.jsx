import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload } from 'react-icons/fi';
import { createTrip } from '../redux/slices/tripSlice';
import { TRAVEL_TYPES, CURRENCIES } from '../utils/constants';
import { toast } from 'react-toastify';

const CreateTrip = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.trips);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    country: '',
    description: '',
    budget: '',
    currency: 'USD',
    travelType: 'solo',
    startDate: '',
    endDate: '',
    numberOfTravelers: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    const result = await dispatch(createTrip(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Trip created successfully!');
      navigate(`/trips/${result.payload._id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/trips" className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Trips
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Create New Trip</h1>
        <p className="text-dark-500 dark:text-dark-400 mb-8">Plan your next adventure</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Trip Details</h2>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Trip Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="input-field" placeholder="Summer in Europe" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <input type="text" name="destination" value={formData.destination} onChange={handleChange} required className="input-field" placeholder="Paris" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} required className="input-field" placeholder="France" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="input-field" placeholder="Tell us about this trip..." />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Dates & Travelers</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Travel Type</label>
                <select name="travelType" value={formData.travelType} onChange={handleChange} className="input-field">
                  {TRAVEL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Number of Travelers</label>
                <input type="number" name="numberOfTravelers" value={formData.numberOfTravelers} onChange={handleChange} min={1} className="input-field" />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Budget</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Budget</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} min={0} className="input-field" placeholder="5000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="input-field">
                  {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? 'Creating...' : 'Create Trip'}
            </button>
            <Link to="/trips" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateTrip;
