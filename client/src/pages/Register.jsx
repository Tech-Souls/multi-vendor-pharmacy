import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from 'react-hot-toast';
import { Pill, Lock, User, Briefcase, MapPin, CheckCircle, Shield, Star, Info, FileText, AlertCircle } from 'lucide-react';
import API from "../api/axios";

// ✅ Outside component — no re-mount on typing
const InputGroup = ({ label, name, type = "text", placeholder, options = null, value, onChange, required = true }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {options ? (
      <select
        value={value || ""}
        onChange={onChange}
        className="w-full px-[18px] py-[14px] border-[1.5px] border-slate-200 rounded-[10px] text-[13px] text-slate-900 bg-white outline-none cursor-pointer font-inherit transition-colors focus:border-slate-900"
      >
        <option value="">Select...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        required={required}
        className="w-full px-[18px] py-[14px] border-[1.5px] border-slate-200 rounded-[10px] text-[13px] text-slate-900 bg-white outline-none box-border font-inherit transition-colors focus:border-slate-900"
      />
    )}
  </div>
);

const SectionHeader = ({ icon: Icon, title, step, total }) => (
  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
        <Icon size={16} color="white" />
      </div>
      <span className="text-sm font-bold text-slate-900">{title}</span>
    </div>
    <span className="text-[11px] text-slate-400 font-semibold">
      Step {step} of {total}
    </span>
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  
  const [isLedByMedicalProf, setIsLedByMedicalProf] = useState(null); 
  const [accountType, setAccountType] = useState("Prescriber");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    salutation: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
     phoneNumber: '',               // Ensure this matches the key expected by backend
    address: '',                   // Ensure this matches the key expected by backend
    dob: '',
    accountType: 'Prescriber',     // Dynamic base setting matching selection
    isAuthorisedProfessional: true, 
    agreedToTerms: false           // Connected directly to validation checkbox
  });

  // Generic change handler for text/select fields and checkbox validation
  const handleChange = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextAction = (e) => {
    e.preventDefault();
    if (subStep === 1) {
      if (isLedByMedicalProf === null) {
        return toast.error("Please make a selection before moving forward.");
      }
      setSubStep(2);
    } else {
      handleRegister(e);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (!formData.agreedToTerms) {
      return toast.error("You must agree to the terms and conditions.");
    }
    
    setLoading(true);
    try {
      // Explicitly bundle config fields to match backend controller requirements exactly
      const finalPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dob: formData.dob,
        agreedToTerms: formData.agreedToTerms,
        isAuthorisedProfessional: isLedByMedicalProf === true, 
        accountType: isLedByMedicalProf ? accountType : undefined
      };

      await API.post("/auth/register", finalPayload);
      toast.success("Verification code sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/verify-otp", { email: formData.email, otp });
      toast.success("Account verified successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-['DM_Sans','Segoe_UI',sans-serif] flex items-center justify-center p-6 sm:p-10 box-border">
      <div className="w-full max-w-[1100px] bg-white rounded-2xl overflow-hidden flex border border-slate-200 shadow-sm">
        <div className="flex-1 p-8 sm:p-12 md:p-14 lg:p-16 box-border">

          {step === 1 ? (
            <form onSubmit={handleNextAction}>
              
              {/* ── SUB-STEP 1: CHOICE & SCREENING INFOGRAPHICS ── */}
              {subStep === 1 && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2.5">
                      Are you or do you work with a Registered UK Medical Professional?
                    </h2>
                    <p className="text-slate-500 text-[13px] leading-relaxed">
                      Please select if your company is healthcare professional led. This will help us determine what kind of Healthxchange account you require.
                    </p>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 mb-10">
                    
                    {/* Option Box: YES */}
                    <div 
                      onClick={() => { setIsLedByMedicalProf(true); setAccountType("Prescriber"); }}
                      className={`border rounded-xl p-6 md:p-7 cursor-pointer transition-all ${
                        isLedByMedicalProf === true ? 'border-2 border-slate-900' : 'border-[1.5px] border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                          isLedByMedicalProf === true ? 'border-slate-900' : 'border-slate-300'
                        }`}>
                          {isLedByMedicalProf === true && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight mb-2">
                            Yes we are led by a Registered UK Medical Professional.
                          </h4>
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mb-4">
                            I am a medical professional and/or the company has at least one registered UK medical professional that is one of the below.
                          </p>
                          <ul className="text-[11.5px] text-slate-600 leading-relaxed pl-4 space-y-0.5">
                            <li>Doctor registered with the GMC</li>
                            <li>Dentist registered with the GDC</li>
                            <li>Nurse or Midwife registered with the NMC</li>
                            <li>Pharmacist Independent Prescriber registered with the GPHC or PSNI</li>
                            <li>Independent Prescriber registered with the HCPC</li>
                            <li>Dental Therapist registered with the GDC</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Option Box: NO */}
                    <div 
                      onClick={() => { setIsLedByMedicalProf(false); setAccountType("user"); }}
                      className={`border rounded-xl p-6 md:p-7 cursor-pointer transition-all ${
                        isLedByMedicalProf === false ? 'border-2 border-slate-900' : 'border-[1.5px] border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                          isLedByMedicalProf === false ? 'border-slate-900' : 'border-slate-300'
                        }`}>
                          {isLedByMedicalProf === false && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight mb-2">
                            No we are not led by a Registered UK Medical Professional.
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            We currently have no registered UK medical professionals working within our company and wish to create a therapist account.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* ── BEFORE YOU PROCEED CONDITIONAL INFOGRAPHICS ── */}
                  {isLedByMedicalProf === true && (
                    <div className="transition-all duration-300">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.05em] mb-[18px]">
                        BEFORE YOU PROCEED...
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                        
                        {/* Card 1 */}
                        <div className="border border-slate-200 rounded-xl p-5">
                          <div className="flex gap-2.5 mb-3">
                            <AlertCircle size={18} color="#0f172a" className="shrink-0" />
                            <h5 className="text-[13px] font-extrabold text-slate-900 leading-tight">You must be one of the following:</h5>
                          </div>
                          <ul className="text-[13px] text-slate-600 leading-relaxed pl-3.5 space-y-0.5">
                            <li>A UK qualified prescriber.</li>
                            <li>You employ / work with a UK qualified prescriber.</li>
                            <li>You are a qualified HCP ordering Non Prescription items.</li>
                          </ul>
                        </div>

                        {/* Card 2 */}
                        <div className="border border-slate-200 rounded-xl p-5">
                          <div className="flex gap-2.5 mb-3">
                            <FileText size={18} color="#0f172a" className="shrink-0" />
                            <h5 className="text-[13px] font-extrabold text-slate-900 leading-tight">Prescribers will need:</h5>
                          </div>
                          <ul className="text-[13px] text-slate-600 leading-relaxed pl-3.5 space-y-0.5 mb-3">
                            <li>A copy of their Passport or Drivers License*.</li>
                            <li>A mobile phone number.</li>
                            <li>An email address (must not be generic).</li>
                          </ul>
                          <p className="text-[13px] text-slate-500 italic leading-relaxed">
                            *This information including Photo ID is essential for opening your account
                          </p>
                        </div>

                        {/* Card 3 */}
                        <div className="border border-slate-200 rounded-xl p-5">
                          <div className="flex gap-2.5 mb-3">
                            <User size={18} color="#0f172a" className="shrink-0" />
                            <h5 className="text-[13px] font-extrabold text-slate-900 leading-tight">Photo ID must be:</h5>
                          </div>
                          <ul className="text-[13px] text-slate-600 leading-relaxed pl-3.5 space-y-0.5">
                            <li>A valid Passport or Drivers License.</li>
                            <li>In colour.</li>
                            <li>Clear and in sharp focus.</li>
                            <li>Readable and not have any reflections obscuring the details.</li>
                            <li>Clearly showing name, signature and expiry date.</li>
                            <li>An image format (e.g. JPG, PNG), <strong className="text-slate-900">not PDF</strong>.</li>
                          </ul>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Navigation Control Toolbar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                    <p className="text-xs text-slate-500 m-0">
                      Already have an account?{' '}
                      <Link to="/login" className="text-slate-900 underline font-semibold">
                        Sign In
                      </Link>
                    </p>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-9 py-3.5 bg-slate-900 text-white border-none rounded-lg text-[13px] font-bold cursor-pointer"
                    >
                      Confirm & Continue
                    </button>
                  </div>
                </div>
              )}

              {/* ── SUB-STEP 2: SPLIT LAYOUT TWO-COLUMN ACCOUNT REGISTRATION ── */}
              {subStep === 2 && (
                <div>
                  <div className="mb-8">
                    <button 
                      type="button" 
                      onClick={() => setSubStep(1)}
                      className="bg-none border-none text-slate-900 text-xs font-bold cursor-pointer p-0 flex items-center gap-1 mb-3.5 underline"
                    >
                      &larr; Back to initial screening
                    </button>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2.5">
                      Create your Healthxchange account
                    </h2>
                    <p className="text-[12.5px] text-slate-500 leading-relaxed">
                      We need to know a bit about you first so we can create your account. The email you enter below and the password you set on this screen will let you come back to finish your registration at any time. Once you complete and submit your registration for approval you will then receive a new Username and Password that you will use to access the e-pharmacy.
                    </p>
                  </div>

                  {/* Two Column Layout Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    
                    {/* Left Column: YOUR DETAILS */}
                    <div className="flex flex-col gap-5">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.05em] border-b border-slate-100 pb-2.5 m-0 mb-1">
                        YOUR DETAILS
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                          <InputGroup label="Salutation" name="salutation" options={["Mr", "Mrs", "Ms", "Dr", "Prof"]} value={formData.salutation} onChange={handleChange("salutation")} required={false} />
                        </div>
                        <div className="sm:col-span-2">
                          <InputGroup label="First name" name="firstName" value={formData.firstName} onChange={handleChange("firstName")} />
                        </div>
                      </div>

                      <InputGroup label="Last name" name="lastName" value={formData.lastName} onChange={handleChange("lastName")} />
                      <InputGroup label="Email address" name="email" type="email" value={formData.email} onChange={handleChange("email")} />
                      <InputGroup label="Phone number" name="phoneNumber" placeholder="+44" value={formData.phoneNumber} onChange={handleChange("phoneNumber")} />
                      <InputGroup label="Home Address" name="address" value={formData.address} onChange={handleChange("address")} />
                      <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange("dob")} />
                    </div>

                    {/* Right Column: CREATE A PASSWORD & AGREEMENTS */}
                    <div className="flex flex-col gap-5">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.05em] border-b border-slate-100 pb-2.5 m-0 mb-1">
                        CREATE A PASSWORD
                      </h3>

                      <InputGroup label="Password" name="password" type="password" value={formData.password} onChange={handleChange("password")} />
                      <InputGroup label="Repeat Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} />

                      <div className="border border-slate-200 p-4 rounded-[10px] text-[11.5px] text-slate-600 flex flex-col gap-2">
                        <span className="font-bold text-slate-900">Password requirements:</span>
                        <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-900" /> Minimum of 8 characters</div>
                        <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-900" /> At least one uppercase letter</div>
                        <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-900" /> At least one number</div>
                        <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-900" /> At least one special character (e.g. ! % & ?)</div>
                      </div>

                      {/* System Agreements & Term Checklist Hooks */}
                      <div className="mt-3 flex flex-col gap-3">
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-relaxed">
                          <input type="checkbox" checked={formData.agreedToTerms} onChange={handleChange("agreedToTerms")} required className="mt-0.5 accent-slate-900" />
                          <span>I accept and agree to the website Terms of Use and Privacy Policy.</span>
                        </label>
                      </div>

                      {/* Action Submission Trigger */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-4 bg-slate-900 text-white border-none rounded-[10px] text-[13px] font-bold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
                      </button>

                    </div>
                  </div>
                </div>
              )}

            </form>
          ) : (
            /* ── SECOND BLOCK CANVAS VIEW: TWO FACTOR OTP CODE ENTRY SCREEN ── */
            <div className="max-w-[440px] mx-auto my-12 text-center px-4 sm:px-0">
              <div className="w-16 h-16 rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-6">
                <Lock size={26} color="#0f172a" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2.5">
                Enter Security Code
              </h2>
              <p className="text-[13.5px] text-slate-500 leading-relaxed mb-8">
                We have sent a 6-digit confirmation code to <strong className="text-slate-900">{formData.email}</strong>. Please enter the code below to complete confirmation.
              </p>

              <form onSubmit={handleVerify} className="flex flex-col gap-5">
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-[22px] font-bold text-center tracking-[0.3em] outline-none bg-white transition-colors focus:border-slate-900"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 text-white border-none rounded-xl text-sm font-bold cursor-pointer disabled:opacity-70"
                >
                  {loading ? 'Verifying Code...' : 'Verify & Activate Account'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-none border-none text-slate-500 text-xs font-semibold mt-6 cursor-pointer underline"
              >
                Change email address or settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;