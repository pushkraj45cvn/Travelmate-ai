import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { getTrip, updateTrip } from '../redux/slices/tripSlice';
import { TRAVEL_TYPES, CURRENCIES, TRIP_STATUSES } from '../utils/constants';
import { toast } from 'react-toastify';

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTrip, isLoading } = useSelector((state) => state.trips);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    dispatch(getTrip(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTrip) {
      setFormData({
        title: currentTrip.title || '',
        destination: currentTrip.destination || '',
        country: currentTrip.country || '',
        description: currentTrip.description || '',
        budget: currentTrip.budget || '',
        currency: currentTrip.currency || 'USD',
        travelType: currentTrip.travelType || 'solo',
        startDate: currentTrip.startDate ? currentTrip.startDate.split('T')[0] : '',
        endDate: currentTrip.endDate ? currentTrip.endDate.split('T')[0] : '',
        numberOfTravelers: currentTrip.numberOfTravelers || 1,
        status: currentTrip.status || 'planning',
      });
    }
  }, [currentTrip]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    const result = await dispatch(updateTrip({ id, tripData: formData }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Trip updated!');
      navigate(`/trips/${id}`);
    }
  };

  if (!formData) {
    return <div className="skeleton h-96 w-full rounded-2xl" />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/trips/${id}`} className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Trip
      </Link>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Edit Trip</h1>
        <p className="text-dark-500 dark:text-dark-400 mb-8">Update your trip details</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Trip Details</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Trip Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <input type="text" name="destination" value={formData.destination} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} required className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                  {TRIP_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Travel Type</label>
                <select name="travelType" value={formData.travelType} onChange={handleChange} className="input-field">
                  {TRAVEL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Travelers</label>
                <input type="number" name="numberOfTravelers" value={formData.numberOfTravelers} onChange={handleChange} min={1} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="input-field">
                  {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Budget</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} min={0} className="input-field" />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to={`/trips/${id}`} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditTrip;
