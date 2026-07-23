import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload, FiPlus, FiX } from 'react-icons/fi';
import { createTrip, resetTrips } from '../redux/slices/tripSlice';
import { TRAVEL_TYPES, CURRENCIES } from '../utils/constants';
import { toast } from 'react-toastify';
import api from '../services/api';

const CreateTrip = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const destData = location.state?.fromDestination || {};
  const { isLoading } = useSelector((state) => state.trips);
  const { user } = useSelector((state) => state.auth);
  const userPlan = user?.plan || 'free';
  const isTeamPlan = userPlan === 'team';
  const isProPlan = userPlan === 'pro';
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const maxTravelers = isTeamPlan ? 4 : isProPlan ? 1 : 20;
  const [travelerNames, setTravelerNames] = useState(['']);
  const [travelerAges, setTravelerAges] = useState(['']);
  const [formData, setFormData] = useState({
    title: destData.title || searchParams.get('destination') || '',
    destination: destData.destination || searchParams.get('destination') || '',
    country: destData.country || searchParams.get('country') || '',
    description: destData.description || '',
    budget: destData.budget !== undefined && destData.budget !== '' ? destData.budget : '',
    currency: destData.currency || 'USD',
    travelType: 'solo',
    startDate: '',
    endDate: '',
    numberOfTravelers: 1,
  });

  useEffect(() => {
    dispatch(resetTrips());
  }, [dispatch]);

  useEffect(() => {
    if (isProPlan) {
      setFormData(prev => ({ ...prev, numberOfTravelers: 1 }));
      setTravelerNames(['']);
      setTravelerAges(['']);
    }
    if (isTeamPlan) {
      api.get('/users/team-members')
        .then(res => {
          const members = (res.data.data || []).filter(m => m._id !== user?.id);
          setTeamMembers(members);
        })
        .catch(() => {});
    }
  }, [isProPlan, isTeamPlan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'numberOfTravelers') {
      const count = Math.min(parseInt(value) || 1, maxTravelers);
      setTravelerNames(prev => {
        const arr = [...prev];
        while (arr.length < count) arr.push('');
        return arr.slice(0, count);
      });
      setTravelerAges(prev => {
        const arr = [...prev];
        while (arr.length < count) arr.push('');
        return arr.slice(0, count);
      });
    }
  };

  const updateTravelerName = (index, name) => {
    setTravelerNames(prev => {
      const arr = [...prev];
      arr[index] = name;
      return arr;
    });
  };

  const updateTravelerAge = (index, age) => {
    setTravelerAges(prev => {
      const arr = [...prev];
      arr[index] = age;
      return arr;
    });
  };

  const toggleMember = (member) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m._id === member._id);
      if (exists) return prev.filter(m => m._id !== member._id);
      return [...prev, member];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    const tripPayload = {
      ...formData,
      budget: formData.budget !== '' ? Number(formData.budget) : undefined,
      numberOfTravelers: Math.max(parseInt(formData.numberOfTravelers) || 1, selectedMembers.length + 1),
      collaborators: selectedMembers.map(m => ({ user: m._id, role: 'editor' })),
    };
    const result = await dispatch(createTrip(tripPayload));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Trip created successfully!');
      navigate(`/trips/${result.payload._id}`);
    } else if (result.meta.requestStatus === 'rejected') {
      toast.error(result.payload || 'Failed to create trip. Please check all fields.');
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
                <label className="block text-sm font-medium mb-2">
                  Number of Travelers
                  {isTeamPlan && <span className="text-xs text-dark-400 ml-1">(max {maxTravelers})</span>}
                  {isProPlan && <span className="text-xs text-dark-400 ml-1">(Solo)</span>}
                </label>
                <input type="number" name="numberOfTravelers" value={formData.numberOfTravelers} onChange={handleChange} min={1} max={maxTravelers} readOnly={isProPlan} className={`input-field ${isProPlan ? 'opacity-60 cursor-not-allowed' : ''}`} />
              </div>
            </div>

            {/* Traveler Names & Ages */}
            <div className="border-t border-gray-100 dark:border-dark-700 pt-5 mt-2">
              <label className="block text-sm font-medium mb-3">
                Travelers
                <span className="text-xs text-dark-400 ml-2">({travelerNames.length} of {maxTravelers})</span>
              </label>
              <div className="hidden md:grid md:grid-cols-[1fr_80px_1fr_auto] gap-3 mb-2 px-1">
                <span className="text-xs font-medium text-dark-400 uppercase tracking-wide">Traveler Name</span>
                <span className="text-xs font-medium text-dark-400 uppercase tracking-wide">Age</span>
                <span className="text-xs font-medium text-dark-400 uppercase tracking-wide">Team / Type</span>
                <span className="w-6" />
              </div>
              <div className="space-y-2">
                {travelerNames.map((name, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <div key={idx} className="grid md:grid-cols-[1fr_80px_1fr_auto] gap-2 items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${isFirst ? 'bg-gradient-to-br from-primary-500 to-accent-500' : name ? 'bg-gradient-to-br from-primary-400 to-accent-400' : 'bg-dark-200 dark:bg-dark-600'}`}>
                          {isFirst ? (user?.name?.charAt(0) || 'Y') : (name?.charAt(0)?.toUpperCase() || '?')}
                        </div>
                        <input type="text" value={isFirst ? (user?.name || '') : name} onChange={(e) => updateTravelerName(idx, e.target.value)} className="input-field text-sm flex-1" placeholder={isFirst ? 'Your name' : `Traveler ${idx + 1} name`} />
                      </div>
                      <input type="number" value={travelerAges[idx] || ''} onChange={(e) => updateTravelerAge(idx, e.target.value)} min={1} max={150} className="input-field text-sm w-full" placeholder="Age" />
                      <div className="flex items-center gap-2">
                        {isTeamPlan && !isFirst ? (
                          <select value={name} onChange={(e) => { if (e.target.value === '__other__') { updateTravelerName(idx, ''); } else { updateTravelerName(idx, e.target.value); const mem = teamMembers.find(m => m.name === e.target.value); if (mem && !selectedMembers.some(s => s._id === mem._id)) toggleMember(mem); } }} className="input-field text-sm">
                            <option value="">-- Type or select --</option>
                            <option value="__other__">Other (type name)</option>
                            {teamMembers.map(m => <option key={m._id} value={m.name}>{m.name} (Team)</option>)}
                          </select>
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isFirst ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : name ? 'bg-gray-100 dark:bg-dark-700 text-dark-500' : ''}`}>
                            {isFirst ? 'Trip Owner' : name ? 'Guest' : ''}
                          </span>
                        )}
                      </div>
                      {!isProPlan && travelerNames.length > 1 && (
                        <button type="button" onClick={() => { const newNames = travelerNames.filter((_, i) => i !== idx); setTravelerNames(newNames); setTravelerAges(prev => prev.filter((_, i) => i !== idx)); }} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors"><FiX className="w-3.5 h-3.5" /></button>
                      )}
                      {isProPlan && <span className="w-6" />}
                    </div>
                  );
                })}
              </div>
              {!isProPlan && travelerNames.length < maxTravelers && (
                <button type="button" onClick={() => { setTravelerNames(prev => [...prev, '']); setTravelerAges(prev => [...prev, '']); setFormData(prev => ({ ...prev, numberOfTravelers: prev.numberOfTravelers + 1 })); }} className="mt-3 flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 font-medium">
                  <FiPlus className="w-4 h-4" /> Add another traveler
                </button>
              )}
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
