// src/pages/AddListing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  FiUpload, FiX, FiImage, FiHome,
} from 'react-icons/fi';
import { AMENITIES_LIST, LISTING_TYPES } from '../utils/helpers';
import MapPicker from '../components/MapPicker';

const EMPTY_FORM = {
  title: '', description: '', price: '', location: '',
  lat: '', lng: '',
  amenities:      [],
  type:           'bedsitter',
  isAvailable:    true,
  totalUnits:     1,
  availableUnits: 1,
};

const AddListing = () => {
  const { id }   = useParams();
  const isEdit   = !!id;
  const navigate = useNavigate();

  const [form,           setForm]           = useState(EMPTY_FORM);
  const [loading,        setLoading]        = useState(false);
  const [fetching,       setFetching]       = useState(isEdit);
  const [newFiles,       setNewFiles]       = useState([]);
  const [newPreviews,    setNewPreviews]    = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        const l = data.listing;
        setForm({
          title:          l.title          || '',
          description:    l.description    || '',
          price:          l.price          || '',
          location:       l.location       || '',
          lat:            l.coordinates?.latitude  || '',
          lng:            l.coordinates?.longitude || '',
          amenities:      l.amenities      || [],
          type:           l.type           || 'bedsitter',
          isAvailable:    l.isAvailable    ?? true,
          totalUnits:     l.totalUnits     ?? 1,
          availableUnits: l.availableUnits ?? 1,
        });
        setExistingImages(l.images || []);
      } catch {
        toast.error('Failed to load listing.');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };
    fetchListing();
  }, [id, isEdit]);

  useEffect(() => {
    return () => newPreviews.forEach(URL.revokeObjectURL);
  }, [newPreviews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'totalUnits') {
        const total = Number(value) || 1;
        const avail = Math.min(Number(prev.availableUnits), total);
        return { ...updated, totalUnits: total, availableUnits: avail };
      }
      if (name === 'availableUnits') {
        const avail = Math.max(0, Math.min(Number(value), Number(prev.totalUnits)));
        return { ...updated, availableUnits: avail };
      }
      return updated;
    });
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Called by MapPicker when GPS is captured or cleared
  const handlePinPick = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      lat: lat !== null ? String(lat) : '',
      lng: lng !== null ? String(lng) : '',
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (existingImages.length + newFiles.length + files.length > 10) {
      toast.error('Maximum 10 images allowed.');
      return;
    }
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const removeNewFile = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length + newFiles.length === 0) {
      toast.error('Please add at least one image.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',          form.title);
      fd.append('description',    form.description);
      fd.append('price',          form.price);
      fd.append('location',       form.location);
      fd.append('type',           form.type);
      fd.append('isAvailable',    String(form.isAvailable));
      fd.append('amenities',      JSON.stringify(form.amenities));
      fd.append('totalUnits',     String(form.totalUnits));
      fd.append('availableUnits', String(form.availableUnits));
      if (form.lat) fd.append('lat', form.lat);
      if (form.lng) fd.append('lng', form.lng);
      newFiles.forEach((file) => fd.append('images', file));
      if (isEdit) fd.append('keepImages', JSON.stringify(existingImages));

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEdit) {
        await api.put(`/listings/${id}`, fd, config);
        toast.success('Listing updated!');
        navigate(`/listings/${id}`);
      } else {
        const { data } = await api.post('/listings', fd, config);
        toast.success('Listing published!');
        navigate(`/listings/${data.listing._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-xl" />)}
    </div>
  );

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <h1 className="font-display text-3xl font-bold text-dark-900 mb-2">
        {isEdit ? '✏️ Edit Listing' : '🏠 Add New Listing'}
      </h1>
      <p className="text-dark-500 mb-8">
        {isEdit ? 'Update your listing details.' : 'Fill in the details to publish your property.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Info ─────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-dark-900">Basic Information</h2>

          <div>
            <label className="label">Title *</label>
            <input
              name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Modern Bedsitter Near University"
              className="input" required
            />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the property — size, features, what's nearby…"
              rows={5} className="input resize-none" required maxLength={2000}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/2000</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Monthly Rent (KSh) *</label>
              <input
                name="price" type="number" value={form.price} onChange={handleChange}
                placeholder="8500" min="0" className="input" required
              />
            </div>
            <div>
              <label className="label">Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className="input">
                {LISTING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Units ──────────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FiHome size={18} className="text-primary-500" />
            <h2 className="font-display font-semibold text-dark-900">Unit Availability</h2>
          </div>
          <p className="text-sm text-dark-400">
            Have multiple identical units? List them together and track how many are free.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Total units *</label>
              <input
                name="totalUnits" type="number" value={form.totalUnits}
                onChange={handleChange} min="1" max="500" className="input" required
              />
              <p className="text-xs text-dark-400 mt-1">How many identical units you have</p>
            </div>
            <div>
              <label className="label">Currently available *</label>
              <input
                name="availableUnits" type="number" value={form.availableUnits}
                onChange={handleChange} min="0" max={form.totalUnits} className="input" required
              />
              <p className="text-xs text-dark-400 mt-1">How many are vacant right now</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
            form.availableUnits > 0
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${form.availableUnits > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            {form.availableUnits > 0
              ? `${form.availableUnits} of ${form.totalUnits} unit${form.totalUnits > 1 ? 's' : ''} available — listing is ACTIVE`
              : `All ${form.totalUnits} units occupied — listing will be marked NOT AVAILABLE`
            }
          </div>
        </div>

        {/* ── Photos ─────────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-dark-900 flex items-center gap-2">
              <FiImage size={18} className="text-primary-500" />
              Photos ({totalImages}/10)
            </h2>
            {totalImages < 10 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="btn-primary !py-2 !px-4 text-sm">
                <FiUpload size={14} /> Add Photos
              </button>
            )}
          </div>

          <input
            ref={fileInputRef} type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple onChange={handleFileSelect} className="hidden"
          />

          {totalImages === 0 ? (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-300 hover:text-primary-400 transition-colors">
              <FiUpload size={28} />
              <p className="text-sm font-medium">Tap to select photos from your phone or computer</p>
              <p className="text-xs">JPEG, PNG, WebP — max 5MB each</p>
            </button>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {existingImages.map((url, i) => (
                <div key={`existing-${i}`} className="relative group aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium">Cover</span>}
                  <button type="button" onClick={() => removeExistingImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiX size={12} />
                  </button>
                </div>
              ))}
              {newPreviews.map((preview, i) => (
                <div key={`new-${i}`} className="relative group aspect-square">
                  <img src={preview} alt="" className="w-full h-full object-cover rounded-lg" />
                  {i === 0 && existingImages.length === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium">Cover</span>}
                  <button type="button" onClick={() => removeNewFile(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiX size={12} />
                  </button>
                </div>
              ))}
              {totalImages < 10 && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary-300 hover:text-primary-400 transition-colors">
                  <FiUpload size={20} />
                  <span className="text-xs">Add more</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Location ───────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-dark-900">Location</h2>

          {/* Text address — always required */}
          <div>
            <label className="label">Address / Area *</label>
            <input
              name="location" value={form.location} onChange={handleChange}
              placeholder="e.g. Westlands, Nairobi" className="input" required
            />
          </div>

          {/* GPS share — always visible, no toggle needed */}
          <div>
            <label className="label">
              Exact GPS location
              <span className="text-gray-400 font-normal ml-1">(optional but recommended)</span>
            </label>
            <p className="text-xs text-dark-400 mb-3">
              Tap the button below — your phone will ask you to enable location, exactly like WhatsApp.
            </p>
            <MapPicker
              lat={form.lat || null}
              lng={form.lng || null}
              onPick={handlePinPick}
            />
          </div>
        </div>

        {/* ── Amenities ──────────────────────────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-dark-900 mb-4">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES_LIST.map((a) => (
              <label key={a}
                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all
                  ${form.amenities.includes(a)
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-gray-100 hover:border-gray-200 text-dark-600'
                  }`}>
                <input type="checkbox" checked={form.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)} className="sr-only" />
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  form.amenities.includes(a) ? 'border-primary-400 bg-primary-400' : 'border-gray-300'
                }`}>
                  {form.amenities.includes(a) && <span className="text-white text-xs leading-none">✓</span>}
                </span>
                {a}
              </label>
            ))}
          </div>
        </div>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 !py-3">
            {loading
              ? (isEdit ? 'Saving…' : 'Publishing…')
              : (isEdit ? '💾 Save Changes' : '🚀 Publish Listing')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddListing;