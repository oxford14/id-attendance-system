import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, MapPin, Phone, GraduationCap, Users } from 'lucide-react';

const StudentEnrollment = ({ onCancel, onSuccess }) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copyAddress, setCopyAddress] = useState(false);

  const [formData, setFormData] = useState({
    // Learner Information
    email: '',
    role: 'student',
    lrn: '',
    lastName: '',
    firstName: '',
    middleName: '',
    extensionName: '',
    contactNo: '',
    birthDate: '',
    age: '',
    sex: '',
    motherTongue: '',
    belongsToIpCommunity: false,
    ipCommunityName: '',
    is4psBeneficiary: false,
    fourPsHouseholdId: '',
    placeOfBirth: '',
    
    // Current Address
    currentHouseNo: '',
    currentStreet: '',
    currentBarangay: '',
    currentMunicipality: '',
    currentProvince: '',
    currentCountry: 'Philippines',
    currentZipCode: '',
    
    // Permanent Address
    permanentHouseNo: '',
    permanentStreet: '',
    permanentBarangay: '',
    permanentMunicipality: '',
    permanentProvince: '',
    permanentCountry: 'Philippines',
    permanentZipCode: '',
    
    // Parent/Guardian Information
    fatherLastName: '',
    fatherFirstName: '',
    fatherMiddleName: '',
    fatherContactNo: '',
    motherLastName: '',
    motherFirstName: '',
    motherMiddleName: '',
    motherContactNo: '',
    guardianLastName: '',
    guardianFirstName: '',
    guardianMiddleName: '',
    guardianContactNo: '',
    
    // Educational Background
    lastGradeLevel: '',
    lastSchoolYear: '',
    lastSchoolName: '',
    lastSchoolId: '',
    shsCompleter: false,
    shsGenAve: '',
    shsTrack: '',
    shsStrand: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Auto-calculate age when birth date changes
    if (name === 'birthDate' && value) {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: (age - 1).toString() }));
      } else {
        setFormData(prev => ({ ...prev, age: age.toString() }));
      }
    }
  };

  const handleCopyAddress = (e) => {
    const isChecked = e.target.checked;
    setCopyAddress(isChecked);
    
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        permanentHouseNo: prev.currentHouseNo,
        permanentStreet: prev.currentStreet,
        permanentBarangay: prev.currentBarangay,
        permanentMunicipality: prev.currentMunicipality,
        permanentProvince: prev.currentProvince,
        permanentCountry: prev.currentCountry,
        permanentZipCode: prev.currentZipCode
      }));
    }
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.contactNo) {
      return 'Please fill in all required fields.';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address.';
    }
    
    // Required learner information
    if (!formData.lastName || !formData.firstName || !formData.birthDate || !formData.sex) {
      return 'Please fill in all required learner information fields.';
    }
    
    // Age validation
    const age = parseInt(formData.age);
    if (age < 3 || age > 25) {
      return 'Age must be between 3 and 25 years for enrollment.';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      const {
        data,
        error
      } = await supabase.from('student_profile').insert([{
        learner_reference_number: formData.lrn,
        last_name: formData.lastName,
        first_name: formData.firstName,
        middle_name: formData.middleName,
        extension_name: formData.extensionName,
        birthdate: formData.birthDate,
        age: formData.age,
        sex: formData.sex,
        mother_tongue: formData.motherTongue,
        email_address: formData.email,
        phone_number: formData.contactNo,
        current_house_number: formData.currentHouseNo,
        current_sitio_street: formData.currentStreet,
        current_barangay: formData.currentBarangay,
        current_municipality_city: formData.currentMunicipality,
        current_province: formData.currentProvince,
        current_country: formData.currentCountry,
        current_zip_code: formData.currentZipCode,
        permanent_house_number: formData.permanentHouseNo,
        permanent_street: formData.permanentStreet,
        permanent_barangay: formData.permanentBarangay,
        permanent_municipality_city: formData.permanentMunicipality,
        permanent_province: formData.permanentProvince,
        permanent_country: formData.permanentCountry,
        permanent_zip_code: formData.permanentZipCode,
        same_as_current_address: copyAddress,
        place_of_birth_municipality_city: formData.placeOfBirth,
        belongs_to_ip_community: formData.belongsToIpCommunity,
        ip_community_name: formData.ipCommunityName,
        is_4ps_beneficiary: formData.is4psBeneficiary,
        four_ps_household_id: formData.fourPsHouseholdId,
        father_last_name: formData.fatherLastName,
        father_first_name: formData.fatherFirstName,
        father_middle_name: formData.fatherMiddleName,
        father_contact_number: formData.fatherContactNo,
        mother_last_name: formData.motherLastName,
        mother_first_name: formData.motherFirstName,
        mother_middle_name: formData.motherMiddleName,
        mother_contact_number: formData.motherContactNo,
        guardian_last_name: formData.guardianLastName,
        guardian_first_name: formData.guardianFirstName,
        guardian_middle_name: formData.guardianMiddleName,
        guardian_contact_number: formData.guardianContactNo,
        last_grade_level_completed: formData.lastGradeLevel,
        last_school_year_completed: formData.lastSchoolYear,
        last_school_attended: formData.lastSchoolName,
        last_school_id: formData.lastSchoolId,
      }]);

      if (error) {
        throw error;
      }

      setSuccess('Student enrolled successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to enroll student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-3">Student Enrollment</h1>
              <p className="text-primary-100">Complete your registration for Basic Education</p>
              <p className="text-primary-200 text-sm mt-2">All fields marked with * are required</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}
            
            {/* Learner Information */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-primary-100">
              <h2 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-primary-600" />
                Learner Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learner Reference Number (LRN)
                  </label>
                  <input
                    type="text"
                    name="lrn"
                    value={formData.lrn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12-digit LRN"
                    maxLength="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter middle name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extension Name
                  </label>
                  <input
                    type="text"
                    name="extensionName"
                    value={formData.extensionName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jr., Sr., III, etc."
                  />
                </div>

                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="Auto-calculated"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Place of Birth (Municipality/City)
                  </label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter place of birth"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sex *
                  </label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother Tongue
                  </label>
                  <input
                    type="text"
                    name="motherTongue"
                    value={formData.motherTongue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter mother tongue"
                  />
                </div>

                {/* IP Community */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Belonging to any Indigenous Peoples (IP) Community/Indigenous Cultural Community
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="belongsToIpCommunity"
                        value="yes"
                        checked={formData.belongsToIpCommunity === true}
                        onChange={() => setFormData(prev => ({ ...prev, belongsToIpCommunity: true }))}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="belongsToIpCommunity"
                        value="no"
                        checked={formData.belongsToIpCommunity === false}
                        onChange={() => setFormData(prev => ({ ...prev, belongsToIpCommunity: false, ipCommunityName: '' }))}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {formData.belongsToIpCommunity && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        If Yes, please specify:
                      </label>
                      <input
                        type="text"
                        name="ipCommunityName"
                        value={formData.ipCommunityName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter community name"
                      />
                    </div>
                  )}
                </div>

                {/* 4Ps Beneficiary */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is your family a beneficiary of 4Ps?
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is4psBeneficiary"
                        value="yes"
                        checked={formData.is4psBeneficiary === true}
                        onChange={() => setFormData(prev => ({ ...prev, is4psBeneficiary: true }))}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is4psBeneficiary"
                        value="no"
                        checked={formData.is4psBeneficiary === false}
                        onChange={() => setFormData(prev => ({ ...prev, is4psBeneficiary: false, fourPsHouseholdId: '' }))}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {formData.is4psBeneficiary && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        If Yes, write the 4Ps Household ID Number below
                      </label>
                      <input
                        type="text"
                        name="fourPsHouseholdId"
                        value={formData.fourPsHouseholdId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter 4Ps Household ID"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Current Address */}
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-3">
                <MapPin className="w-7 h-7 text-primary-600" />
                Current Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House No./Street
                  </label>
                  <input
                    type="text"
                    name="currentHouseNo"
                    value={formData.currentHouseNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="House number and street"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barangay
                  </label>
                  <input
                    type="text"
                    name="currentBarangay"
                    value={formData.currentBarangay}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter barangay"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Municipality/City
                  </label>
                  <input
                    type="text"
                    name="currentMunicipality"
                    value={formData.currentMunicipality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter municipality/city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <input
                    type="text"
                    name="currentProvince"
                    value={formData.currentProvince}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter province"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="currentCountry"
                    value={formData.currentCountry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter country"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="currentZipCode"
                    value={formData.currentZipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>
            
            {/* Permanent Address */}
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                  Permanent Address
                </h2>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={copyAddress}
                    onChange={handleCopyAddress}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Same as current address</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House No./Street
                  </label>
                  <input
                    type="text"
                    name="permanentHouseNo"
                    value={formData.permanentHouseNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="House number and street"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barangay
                  </label>
                  <input
                    type="text"
                    name="permanentBarangay"
                    value={formData.permanentBarangay}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter barangay"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Municipality/City
                  </label>
                  <input
                    type="text"
                    name="permanentMunicipality"
                    value={formData.permanentMunicipality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter municipality/city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <input
                    type="text"
                    name="permanentProvince"
                    value={formData.permanentProvince}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter province"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="permanentCountry"
                    value={formData.permanentCountry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter country"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="permanentZipCode"
                    value={formData.permanentZipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>
            
            {/* Parent/Guardian Information */}
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-3">
                <Users className="w-7 h-7 text-primary-600" />
                Parent/Guardian Information
              </h2>
              
              {/* Father Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Father's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="fatherLastName"
                      value={formData.fatherLastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Father's last name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="fatherFirstName"
                      value={formData.fatherFirstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Father's first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="fatherMiddleName"
                      value={formData.fatherMiddleName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Father's middle name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="fatherContactNo"
                        value={formData.fatherContactNo}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Father's contact number"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mother Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Mother's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="motherLastName"
                      value={formData.motherLastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mother's last name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="motherFirstName"
                      value={formData.motherFirstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mother's first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="motherMiddleName"
                      value={formData.motherMiddleName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mother's middle name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="motherContactNo"
                        value={formData.motherContactNo}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mother's contact number"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Guardian Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Guardian's Information (if applicable)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="guardianLastName"
                      value={formData.guardianLastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Guardian's last name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="guardianFirstName"
                      value={formData.guardianFirstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Guardian's first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="guardianMiddleName"
                      value={formData.guardianMiddleName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Guardian's middle name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="guardianContactNo"
                        value={formData.guardianContactNo}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Guardian's contact number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Educational Background */}
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-6 flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-primary-600" />
                Educational Background
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Grade Level Completed
                  </label>
                  <input
                    type="text"
                    name="lastGradeLevel"
                    value={formData.lastGradeLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Grade 10, Grade 12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last School Year Completed
                  </label>
                  <input
                    type="text"
                    name="lastSchoolYear"
                    value={formData.lastSchoolYear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2022-2023"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last School Attended
                  </label>
                  <input
                    type="text"
                    name="lastSchoolName"
                    value={formData.lastSchoolName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Name of last school attended"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School ID
                  </label>
                  <input
                    type="text"
                    name="lastSchoolId"
                    value={formData.lastSchoolId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="School ID number"
                  />
                </div>
              </div>
              
              {/* Senior High School Information */}
              <div className="border-t pt-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="shsCompleter"
                    checked={formData.shsCompleter}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Senior High School Completer
                  </label>
                </div>
                
                {formData.shsCompleter && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        General Average
                      </label>
                      <input
                        type="number"
                        name="shsGenAve"
                        value={formData.shsGenAve}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="General average"
                        min="75"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Track
                      </label>
                      <select
                        name="shsTrack"
                        value={formData.shsTrack}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select track</option>
                        <option value="Academic Track">Academic Track</option>
                        <option value="Technical-Vocational-Livelihood (TVL) Track">Technical-Vocational-Livelihood (TVL) Track</option>
                        <option value="Sports Track">Sports Track</option>
                        <option value="Arts and Design Track">Arts and Design Track</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strand
                      </label>
                      <input
                        type="text"
                        name="shsStrand"
                        value={formData.shsStrand}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., STEM, ABM, HUMSS"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-primary-100">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-4 border-2 border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
              >
                {loading ? 'Enrolling Student...' : 'Enroll Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentEnrollment;