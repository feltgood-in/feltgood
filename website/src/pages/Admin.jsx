import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';
import { categories as defaultCategories, products as defaultProducts } from '../data/products';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });
  const [isMainAdmin, setIsMainAdmin] = useState(() => {
    return localStorage.getItem('isMainAdmin') === 'true';
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'homepage';
  
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const [editingSection, setEditingSection] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectingProductFor, setSelectingProductFor] = useState(null);
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [renamingCategory, setRenamingCategory] = useState(false);
  const [renamingCategoryTitle, setRenamingCategoryTitle] = useState('');

  useEffect(() => {
    setRenamingCategory(false);
  }, [activeTab]);
  
  const [homepageData, setHomepageData] = useState(null);
  const [originalHomepageData, setOriginalHomepageData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(null);
  
  const [adminUsers, setAdminUsers] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddAdminPopupOpen, setIsAddAdminPopupOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(() => {
    const saved = localStorage.getItem('draftProduct');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (editingProduct) {
      localStorage.setItem('draftProduct', JSON.stringify(editingProduct));
    } else {
      localStorage.removeItem('draftProduct');
    }
  }, [editingProduct]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHomepageData();
      fetchProductsData();
      fetchMessagesData();
      if (isMainAdmin) {
        fetchAdminUsers();
      }
    }
  }, [isAuthenticated, isMainAdmin]);

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setAdminUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail })
      });
      const result = await res.json();
      if (result.success) {
        setAdminUsers([result.user, ...adminUsers]);
        setNewAdminEmail('');
        setIsAddAdminPopupOpen(false);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Error adding admin');
    }
  };

  const handleRemoveAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to remove this admin?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAdminUsers(adminUsers.filter(u => u._id !== id));
      }
    } catch (err) {
      alert('Error removing admin');
    }
  };

  const fetchHomepageData = async () => {
    try {
      const res = await fetch('/api/homepage');
      const data = await res.json();
      setHomepageData(data);
      setOriginalHomepageData(JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProductsData = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessagesData = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsMainAdmin(false);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('isMainAdmin');
  };

  const handleImageUpload = async (file, index, type = 'banner') => {
    if (!file) return;
    setUploadingImage(`${type}-${index}`);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      
      if (result.success) {
        if (type === 'banner') {
          const newBanners = [...homepageData.banners];
          newBanners[index].image = result.publicId;
          setHomepageData({...homepageData, banners: newBanners});
        } else if (type === 'promo') {
          const newCards = [...homepageData.promoCards];
          newCards[index].image = result.publicId;
          setHomepageData({...homepageData, promoCards: newCards});
        }
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during upload.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSaveHomepage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageData)
      });
      if (res.ok) {
        setSuccessMessage('Homepage saved successfully!');
        setOriginalHomepageData(JSON.stringify(homepageData));
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save homepage');
    } finally {
      setLoading(false);
    }
  };

  const handleProductImageUpload = async (file, index = 0) => {
    if (!file) return;
    setUploadingImage(`product-${index}`);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      
      if (result.success) {
        setEditingProduct(prev => {
          const newProduct = { ...prev };
          if (!newProduct.images) newProduct.images = [newProduct.image || '', ''];
          newProduct.images[index] = result.publicId;
          
          if (index === 0) {
            newProduct.image = result.publicId;
          }
          return newProduct;
        });
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during upload.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSaveProduct = async () => {
    if (products.length === 0 && !editingProduct?.id?.startsWith('new-item-')) {
      alert("Please wait for products to finish loading before saving.");
      return;
    }
    setLoading(true);
    try {
      const isNew = !products.find(p => p.id === editingProduct.id);
      let updatedProducts;
      if (isNew) {
        updatedProducts = [editingProduct, ...products]; // Add to top
      } else {
        updatedProducts = products.map(p => p.id === editingProduct.id ? editingProduct : p);
      }
      setProducts(updatedProducts);
      
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories, products: updatedProducts })
      });
      
      if (res.ok) {
        setSuccessMessage('Product saved successfully!');
        setEditingProduct(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewCollection = async () => {
    if (!newCollectionTitle.trim()) return;
    
    const newCatId = newCollectionTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory = {
      id: newCatId,
      title: newCollectionTitle.trim(),
      subtitle: ''
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories, products })
      });
      
      if (res.ok) {
        setSuccessMessage('Collection created successfully!');
        setNewCollectionTitle('');
        setIsAddingCollection(false);
        setActiveTab(`products-${newCategory.id}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save new collection');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameCategory = async () => {
    if (!renamingCategoryTitle.trim()) return;
    
    const categoryId = activeTab.replace('products-', '');
    const updatedCategories = categories.map(c => 
      c.id === categoryId ? { ...c, title: renamingCategoryTitle.trim() } : c
    );
    
    setCategories(updatedCategories);
    setLoading(true);
    
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories, products })
      });
      
      if (res.ok) {
        setSuccessMessage('Collection renamed successfully!');
        setRenamingCategory(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to rename collection');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveCategory = async (direction) => {
    const categoryId = activeTab.replace('products-', '');
    const index = categories.findIndex(c => c.id === categoryId);
    if (index === -1) return;
    if (direction === -1 && index === 0) return; // Already at first position
    if (direction === 1 && index === categories.length - 1) return; // Already at last position
    
    const updatedCategories = [...categories];
    const temp = updatedCategories[index];
    updatedCategories[index] = updatedCategories[index + direction];
    updatedCategories[index + direction] = temp;
    
    setCategories(updatedCategories);
    setLoading(true);
    
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories, products })
      });
      
      if (res.ok) {
        setSuccessMessage('Collection reordered successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reorder collection');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    setCategories(updatedCategories);
    setLoading(true);
    
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories, products })
      });
      
      if (res.ok) {
        setSuccessMessage('Collection deleted successfully!');
        setCategoryToDelete(null);
        setActiveTab(updatedCategories.length > 0 ? `products-${updatedCategories[0].id}` : 'homepage');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete collection');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewProduct = () => {
    const currentCategoryId = activeTab.startsWith('products-') ? activeTab.replace('products-', '') : (categories.length > 0 ? categories[0].id : '');
    const newProduct = {
      id: `new-item-${Date.now()}`,
      itemNumber: '',
      name: '',
      subtitle: '',
      badgeText: '',
      description: '',
      price: 0,
      currency: 'USD',
      categoryId: currentCategoryId,
      image: '',
      images: [],
      pricing: { base: 0, tier5k: 0, tier10k: 0 }
    };
    setEditingProduct(newProduct);
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
        setProductToDelete(null);
        setEditingProduct(null);
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await res.json();
        alert('Failed to delete product: ' + errorData.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  const handleViewMessage = async (msg) => {
    setExpandedMessageId(msg._id);
    if (!msg.read) {
      // Optimistic UI update
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
      try {
        await fetch(`/api/messages/${msg._id}/read`, { method: 'PUT' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== id));
        setMessageToDelete(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete message');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '4rem 3rem',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
          textAlign: 'center',
          maxWidth: '450px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <img 
            src="/feltgood.svg" 
            alt="Felt Good Logo" 
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'contain',
              marginBottom: '0.5rem' 
            }} 
          />
          <h2 style={{ margin: 0, fontSize: '2.2rem', color: 'var(--color-primary, #1e4635)', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Felt Good
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '1rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            Welcome to the admin portal. Sign in securely to manage your products and view inquiries.
          </p>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                shape="pill"
                size="large"
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await fetch('/api/admin/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ credential: credentialResponse.credential })
                    });
                    const result = await res.json();
                    if (result.success) {
                      setIsAuthenticated(true);
                      localStorage.setItem('adminAuth', 'true');
                      if (result.isMainAdmin) {
                        setIsMainAdmin(true);
                        localStorage.setItem('isMainAdmin', 'true');
                      }
                    } else {
                      alert('Login failed: ' + result.message);
                    }
                  } catch (err) {
                    alert('Error during login');
                  }
                }}
                onError={() => {
                  console.log('Login Failed');
                  alert('Login Failed');
                }}
              />
            </div>
          </GoogleOAuthProvider>
        </div>
      </div>
    );
  }

  const unreadMessagesCount = messages.filter(m => !m.read).length;

  return (
    <div style={{ display: 'flex', minHeight: '80vh', borderTop: '1px solid var(--color-sand)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '250px', 
        background: 'var(--color-sand)', 
        padding: '2rem 1rem', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--color-primary)' }}>Admin Panel</h2>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li>
            <button 
              onClick={() => setActiveTab('homepage')} 
              style={{ width: '100%', textAlign: 'left', padding: '0.8rem', background: activeTab === 'homepage' ? 'white' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: activeTab === 'homepage' ? 'bold' : 'normal' }}
            >
              Home Page
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('messages')} 
              style={{ width: '100%', textAlign: 'left', padding: '0.8rem', background: activeTab === 'messages' ? 'white' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: activeTab === 'messages' ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>Messages</span>
              {unreadMessagesCount > 0 && (
                <span style={{ background: '#d93025', color: 'white', borderRadius: '50%', padding: '0.1rem 0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          </li>
        </ul>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Collections</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {categories.map(c => (
            <li key={c.id}>
              <button 
                onClick={() => setActiveTab(`products-${c.id}`)} 
                style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: activeTab === `products-${c.id}` ? 'white' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: activeTab === `products-${c.id}` ? 'bold' : 'normal', fontSize: '0.9rem' }}
              >
                {c.title}
              </button>
            </li>
          ))}
          
          <li style={{ marginTop: '0.5rem' }}>
            {!isAddingCollection ? (
              <button 
                onClick={() => setIsAddingCollection(true)}
                style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: 'transparent', border: '1px dashed #ccc', borderRadius: '4px', cursor: 'pointer', color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                + New Collection
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                <input 
                  type="text" 
                  placeholder="Collection Name..." 
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleCreateNewCollection} disabled={loading} style={{ flex: 1, padding: '0.4rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                  <button onClick={() => { setIsAddingCollection(false); setNewCollectionTitle(''); }} style={{ flex: 1, padding: '0.4rem', background: '#eee', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                </div>
              </div>
            )}
          </li>
        </ul>

        {isMainAdmin && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <button 
                onClick={() => setActiveTab('manage-admin')} 
                style={{ width: '100%', textAlign: 'left', padding: '0.8rem', background: activeTab === 'manage-admin' ? 'white' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: activeTab === 'manage-admin' ? 'bold' : 'normal' }}
              >
                Manage Admin
              </button>
            </li>
          </ul>
        )}
        <button onClick={handleLogout} className="btn btn-outline" style={{ marginTop: !isMainAdmin ? 'auto' : 0, padding: '0.5rem' }}>Logout</button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '0 3rem 3rem 3rem', background: '#faf9f6' }}>
        
        {successMessage && (
          <div style={{
            backgroundColor: 'rgba(46, 191, 104, 0.1)',
            color: '#1e4635',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '3rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.2rem', color: '#2ebf68' }}>✔</span>
            {successMessage}
          </div>
        )}

        {/* HOMEPAGE TAB */}
        {activeTab === 'homepage' && homepageData && editingSection === null && (
          <div>
            <div style={{ position: 'sticky', top: 0, background: '#faf9f6', paddingTop: '3rem', paddingBottom: '1.5rem', zIndex: 10, margin: '0 -3rem 2rem -3rem', paddingLeft: '3rem', paddingRight: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ marginBottom: '0.5rem', marginTop: 0 }}>Manage Homepage</h1>
                <p style={{ margin: 0, color: '#666' }}>Edit the storefront layout and banners.</p>
              </div>
              {originalHomepageData !== JSON.stringify(homepageData) && (
                <button onClick={handleSaveHomepage} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem' }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
            
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#000', margin: 0 }}>Hero Banners</h3>
                <button onClick={() => setEditingSection('banners')} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Edit Banners</button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {homepageData.banners.map(banner => (
                  <div key={banner.id} style={{ width: '120px', height: '80px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                    {banner.image && (
                       <AdvancedImage 
                         cldImg={cld.image(banner.image).resize(fill().width(120).height(80))} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                       />
                     )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#000', margin: 0 }}>Promo Cards (Featured 5)</h3>
                <button onClick={() => setEditingSection('promoCards')} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Edit Promo Cards</button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {homepageData.promoCards && homepageData.promoCards.map(card => (
                  <div key={card.id} style={{ width: '160px', height: '160px', background: '#e0e0e0', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0.5rem', position: 'relative' }}>
                    {card.image ? (
                       <AdvancedImage 
                         cldImg={cld.image(card.image).resize(fill().width(160).height(160))} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                       />
                    ) : (
                       <span style={{ fontSize: '0.8rem', color: '#666' }}>{card.labelSmall} {card.labelLarge}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#000', margin: 0 }}>Homepage Collections</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categories.map(cat => {
                  const selectedIds = homepageData.categoryFeaturedItems?.[cat.id] || [];
                  const isEditing = editingCategory?.id === cat.id;

                  return (
                    <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{homepageData.categoryTitles?.[cat.id] || cat.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                            {selectedIds.length} items selected
                          </p>
                          {!isEditing && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                               {selectedIds.map(id => {
                                 const p = products.find(x => x.id === id);
                                 return p ? <span key={id} style={{ fontSize: '0.8rem', background: '#e0e0e0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{p.name}</span> : null;
                               })}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => isEditing ? setEditingCategory(null) : setEditingCategory(cat)} 
                          className="btn btn-outline" 
                          style={{ padding: '0.4rem 1rem', marginLeft: '1rem' }}
                        >
                          {isEditing ? 'Close' : 'Edit'}
                        </button>
                      </div>

                      {isEditing && (
                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem' }}>
                          <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Collection Display Title</label>
                            <input 
                              type="text" 
                              value={homepageData.categoryTitles?.[cat.id] || cat.title}
                              onChange={(e) => {
                                setHomepageData({
                                  ...homepageData,
                                  categoryTitles: {
                                    ...homepageData.categoryTitles,
                                    [cat.id]: e.target.value
                                  }
                                });
                              }}
                              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
                            />
                          </div>
                          <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Collection Display Subtitle</label>
                            <input 
                              type="text" 
                              value={homepageData.categorySubtitles?.[cat.id] || cat.subtitle}
                              onChange={(e) => {
                                setHomepageData({
                                  ...homepageData,
                                  categorySubtitles: {
                                    ...homepageData.categorySubtitles,
                                    [cat.id]: e.target.value
                                  }
                                });
                              }}
                              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
                            />
                          </div>
                          
                          <p style={{ marginBottom: '1rem', color: '#666', fontWeight: 'bold' }}>
                            Featured Products
                          </p>

                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {selectedIds.map((id, index) => {
                              const product = products.find(p => p.id === id);
                              if (!product) return null;
                              return (
                                <div 
                                  key={`${product.id}-${index}`} 
                                  onClick={() => setSelectingProductFor({ type: 'category', categoryId: cat.id, slotIndex: index })}
                                  style={{ width: '80px', height: '80px', background: '#e0e0e0', borderRadius: '8px', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' }}
                                >
                                   {product.image && (
                                     <AdvancedImage 
                                       cldImg={cld.image(product.image).resize(fill().width(80).height(80))} 
                                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                     />
                                   )}
                                </div>
                              );
                            })}
                            {selectedIds.length < 4 && (
                              <div 
                                onClick={() => setSelectingProductFor({ type: 'category', categoryId: cat.id, slotIndex: selectedIds.length })}
                                style={{ width: '80px', height: '80px', background: '#f9f9f9', border: '2px dashed #ccc', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }}
                              >
                                {selectedIds.length === 0 ? 'Select Products' : '+ Add'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* EDIT BANNERS SUB-VIEW */}
        {activeTab === 'homepage' && homepageData && editingSection === 'banners' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => setEditingSection(null)} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>&larr; Back</button>
                <h1 style={{ margin: 0 }}>Edit Banners</h1>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => {
                    const newBanners = [...homepageData.banners, { id: `b${Date.now()}`, title: 'New Banner', image: '', link: '/collections' }];
                    setHomepageData({...homepageData, banners: newBanners});
                  }} 
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 1rem' }}
                >
                  + Add New Banner
                </button>
                {originalHomepageData !== JSON.stringify(homepageData) && (
                  <button onClick={handleSaveHomepage} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                    {loading ? 'Saving...' : 'Save All Changes'}
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {homepageData.banners.map((banner, index) => (
                <div key={banner.id || index} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
                  <div 
                    onClick={() => document.getElementById(`upload-banner-${index}`).click()}
                    style={{ width: '100%', aspectRatio: '16/9', background: '#e0e0e0', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  >
                    {uploadingImage === `banner-${index}` ? (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#333' }}>
                        Uploading...
                      </div>
                    ) : null}
                    
                    {banner.image ? (
                       <AdvancedImage 
                         cldImg={cld.image(banner.image).resize(fill().width(400).height(225))} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                       />
                     ) : (
                       <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Click to Upload</div>
                     )}
                     
                     <input 
                       type="file" 
                       id={`upload-banner-${index}`} 
                       style={{ display: 'none' }}
                       accept="image/*"
                       onChange={(e) => handleImageUpload(e.target.files[0], index, 'banner')}
                     />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <input 
                      type="text" 
                      value={banner.title} 
                      onChange={(e) => {
                        const newBanners = [...homepageData.banners];
                        newBanners[index].title = e.target.value;
                        setHomepageData({...homepageData, banners: newBanners});
                      }} 
                      placeholder="Banner Title"
                      style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const newBanners = homepageData.banners.filter((_, i) => i !== index);
                      setHomepageData({...homepageData, banners: newBanners});
                    }}
                    style={{ background: 'var(--color-crimson)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                  >
                    Delete
                  </button>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* EDIT PROMO CARDS SUB-VIEW */}
        {activeTab === 'homepage' && homepageData && editingSection === 'promoCards' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => setEditingSection(null)} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>&larr; Back</button>
                <h1 style={{ margin: 0 }}>Edit Promo Cards</h1>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setEditingSection(null)} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Cancel</button>
                <button onClick={handleSaveHomepage} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                  {loading ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                {homepageData.promoCards && homepageData.promoCards.map((card, index) => (
                  <div key={card.id || index} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #eee', flex: 1, minWidth: '180px' }}>
                    
                    <div 
                      onClick={() => document.getElementById(`upload-promo-${index}`).click()}
                      style={{ width: '100%', aspectRatio: '1 / 1', background: '#e0e0e0', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', padding: '4px', boxSizing: 'border-box' }}
                    >
                      {uploadingImage === `promo-${index}` ? (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#333' }}>
                          Uploading...
                        </div>
                      ) : null}
                      
                      {card.image ? (
                         <AdvancedImage 
                           cldImg={cld.image(card.image).resize(fill().width(300).height(300))} 
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                         />
                       ) : (
                         <span style={{ fontSize: '0.8rem', color: '#666' }}>Click to Upload</span>
                       )}
                       
                       <input 
                         type="file" 
                         id={`upload-promo-${index}`} 
                         style={{ display: 'none' }}
                         accept="image/*"
                         onChange={(e) => handleImageUpload(e.target.files[0], index, 'promo')}
                       />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>Target Category URL</label>
                      <select 
                        value={card.filter}
                        onChange={(e) => {
                          const newCards = [...homepageData.promoCards];
                          newCards[index].filter = e.target.value;
                          setHomepageData({...homepageData, promoCards: newCards});
                        }}
                        style={{ padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                      >
                        <option value="all">All Products</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab.startsWith('products-') && (
          <div>
            {editingProduct ? (
              <div style={{ background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => {
                      const original = products.find(p => p.id === editingProduct.id);
                      if (JSON.stringify(original) !== JSON.stringify(editingProduct)) {
                        alert("You have unsaved changes. Please click 'Save Changes' to save, or 'Cancel' to discard them.");
                        return;
                      }
                      setEditingProduct(null);
                    }} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>&larr; Back</button>
                    <h2 style={{ margin: 0 }}>Edit Product: {editingProduct.name}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {!editingProduct?.id?.startsWith('new-item-') && (
                      <button 
                        onClick={() => setProductToDelete(editingProduct._id)} 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 1rem', color: '#d93025', borderColor: '#fce8e6', background: '#fff9f9' }}
                      >
                        Delete
                      </button>
                    )}
                    {JSON.stringify(products.find(p => p.id === editingProduct.id)) !== JSON.stringify(editingProduct) && (
                      <>
                        <button onClick={() => setEditingProduct(null)} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
                          Cancel
                        </button>
                        <button onClick={handleSaveProduct} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                  {/* Left Column: Image */}
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Primary Image</label>
                    <div 
                      onClick={() => document.getElementById('product-image-upload-0').click()}
                      style={{ width: '100%', aspectRatio: '1/1', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc', position: 'relative' }}
                    >
                      {editingProduct.image ? (
                        <AdvancedImage 
                          cldImg={cld.image(editingProduct.image).resize(fill().width(400).height(400))} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ color: '#888' }}>Click to Upload</span>
                      )}
                      {uploadingImage === 'product-0' && (
                        <div style={{ position: 'absolute', background: 'rgba(255,255,255,0.8)', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>Uploading...</div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id="product-image-upload-0" 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(e.target.files[0], 0)}
                    />

                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', marginTop: '1rem' }}>Secondary Image</label>
                    <div 
                      onClick={() => document.getElementById('product-image-upload-1').click()}
                      style={{ width: '100%', aspectRatio: '1/1', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc', position: 'relative' }}
                    >
                      {editingProduct.images && editingProduct.images[1] ? (
                        <AdvancedImage 
                          cldImg={cld.image(editingProduct.images[1]).resize(fill().width(400).height(400))} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ color: '#888' }}>Click to Upload</span>
                      )}
                      {uploadingImage === 'product-1' && (
                        <div style={{ position: 'absolute', background: 'rgba(255,255,255,0.8)', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>Uploading...</div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id="product-image-upload-1" 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(e.target.files[0], 1)}
                    />
                  </div>

                  {/* Right Column: Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label>Product Name</label>
                        <input type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="form-control" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label>Old Price (Strikethrough)</label>
                        <input type="number" step="0.01" value={editingProduct.oldPrice || ''} onChange={e => setEditingProduct({...editingProduct, oldPrice: e.target.value ? parseFloat(e.target.value) : undefined})} className="form-control" placeholder="Leave empty to hide" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label>Currency</label>
                        <select value={editingProduct.currency || 'INR'} onChange={e => setEditingProduct({...editingProduct, currency: e.target.value})} className="form-control" style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Subtitle / Short Label</label>
                        <input type="text" value={editingProduct.subtitle || ''} onChange={e => setEditingProduct({...editingProduct, subtitle: e.target.value})} className="form-control" />
                      </div>
                      <div className="form-group">
                        <label>Badge Text</label>
                        <input type="text" value={editingProduct.badgeText || ''} onChange={e => setEditingProduct({...editingProduct, badgeText: e.target.value})} className="form-control" placeholder="-50%" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea rows="4" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="form-control" style={{ resize: 'vertical' }}></textarea>
                    </div>

                    <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Wholesale Pricing</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                      <div className="form-group">
                        <label>Base Tier</label>
                        <input type="number" step="0.01" value={editingProduct.pricing?.base || 0} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value), pricing: {...editingProduct.pricing, base: parseFloat(e.target.value)}})} className="form-control" />
                      </div>
                      <div className="form-group">
                        <label>5k+ Tier</label>
                        <input type="number" step="0.01" value={editingProduct.pricing?.tier5k || 0} onChange={e => setEditingProduct({...editingProduct, pricing: {...editingProduct.pricing, tier5k: parseFloat(e.target.value)}})} className="form-control" />
                      </div>
                      <div className="form-group">
                        <label>10k+ Tier</label>
                        <input type="number" step="0.01" value={editingProduct.pricing?.tier10k || 0} onChange={e => setEditingProduct({...editingProduct, pricing: {...editingProduct.pricing, tier10k: parseFloat(e.target.value)}})} className="form-control" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <>
              <div style={{ position: 'sticky', top: 0, background: '#faf9f6', paddingTop: '3rem', paddingBottom: '1.5rem', zIndex: 10, margin: '0 -3rem 2rem -3rem', paddingLeft: '3rem', paddingRight: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!renamingCategory ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h1 style={{ margin: 0 }}>Manage: {categories.find(c => c.id === activeTab.replace('products-', ''))?.title || activeTab.replace('products-', '')}</h1>
                      <button 
                        onClick={() => {
                          setRenamingCategoryTitle(categories.find(c => c.id === activeTab.replace('products-', ''))?.title || '');
                          setRenamingCategory(true);
                        }} 
                        className="btn btn-outline" 
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Rename
                      </button>
                      
                      {(() => {
                        const currentCatId = activeTab.replace('products-', '');
                        const index = categories.findIndex(c => c.id === currentCatId);
                        return (
                          <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '1rem' }}>
                            <button 
                              onClick={() => handleMoveCategory(-1)}
                              disabled={index <= 0 || loading}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', opacity: index <= 0 ? 0.5 : 1 }}
                              title="Move Left (Up in list)"
                            >
                              ← Move Left
                            </button>
                            <button 
                              onClick={() => handleMoveCategory(1)}
                              disabled={index === -1 || index >= categories.length - 1 || loading}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', opacity: index === -1 || index >= categories.length - 1 ? 0.5 : 1 }}
                              title="Move Right (Down in list)"
                            >
                              Move Right →
                            </button>
                            <button 
                              onClick={() => setCategoryToDelete(currentCatId)}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#d93025', borderColor: '#fce8e6', background: '#fff9f9', marginLeft: '1rem' }}
                            >
                              Delete Collection
                            </button>
                          </div>
                        );
                      })()}
                      
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={renamingCategoryTitle}
                        onChange={(e) => setRenamingCategoryTitle(e.target.value)}
                        style={{ padding: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', border: '1px solid #ccc', borderRadius: '4px', width: '300px' }}
                        autoFocus
                      />
                      <button onClick={handleRenameCategory} disabled={loading} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>{loading ? 'Saving...' : 'Save'}</button>
                      <button onClick={() => setRenamingCategory(false)} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                    </div>
                  )}
                  <p style={{ margin: 0, color: '#666' }}>Edit items, prices, and upload images for this collection.</p>
                </div>
                <button onClick={handleCreateNewProduct} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}>
                  + New Product
                </button>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #eaeaea' }}>
                    <th style={{ padding: '1rem', width: '90px' }}>Item #</th>
                    <th style={{ padding: '1rem', width: '80px' }}>Image</th>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Price</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.filter(p => p.categoryId === activeTab.replace('products-', '')).map((product, index) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                      <td style={{ padding: '1rem', color: '#555', fontFamily: 'monospace' }}>
                        {product.itemNumber || `ITM-${String(index + 1).padStart(3, '0')}`}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ width: '60px', height: '60px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                          {product.image ? (
                            <AdvancedImage 
                              cldImg={cld.image(product.image).resize(fill().width(100).height(100))} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.8rem' }}>No Img</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{product.name}</td>
                      <td style={{ padding: '1rem' }}>{(!product.currency || product.currency === 'INR') ? '₹' : '$'}{product.price?.toFixed(2) || '0.00'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => setEditingProduct(product)} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                  {products.filter(p => p.categoryId === activeTab.replace('products-', '')).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No products found in this collection.</td>
                    </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </>
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div>
            <div style={{ position: 'sticky', top: 0, background: '#faf9f6', paddingTop: '3rem', paddingBottom: '1.5rem', zIndex: 10, margin: '0 -3rem 2rem -3rem', paddingLeft: '3rem', paddingRight: '3rem' }}>
              <h1 style={{ marginBottom: '0.5rem', marginTop: 0 }}>Messages</h1>
              <p style={{ margin: 0, color: '#666' }}>View wholesale inquiries and contact forms.</p>
            </div>
            
            {messages.length === 0 ? (
              <div style={{ background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>✉️</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No messages yet</h3>
                <p style={{ color: '#888' }}>When customers send an inquiry, it will appear here.</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #eaeaea' }}>
                      <th style={{ padding: '1rem' }}>Date</th>
                      <th style={{ padding: '1rem' }}>Sender</th>
                      <th style={{ padding: '1rem' }}>Source</th>
                      <th style={{ padding: '1rem' }}>Message</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(msg => (
                      <tr 
                        key={msg._id} 
                        onClick={() => handleViewMessage(msg)}
                        style={{ borderBottom: '1px solid #eaeaea', background: expandedMessageId === msg._id ? '#fafafa' : 'white', fontWeight: msg.read ? 'normal' : 'bold', cursor: 'pointer' }}
                      >
                        <td style={{ padding: '1rem', color: '#666', fontSize: '0.85rem' }}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 'inherit', color: '#333' }}>{msg.name}</div>
                          <div style={{ color: '#666', fontSize: '0.85rem', wordBreak: 'break-all', fontWeight: 'normal' }}>{msg.email}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            fontWeight: 'bold', 
                            background: msg.source === 'item_list' ? '#e6f4ea' : '#fce8e6',
                            color: msg.source === 'item_list' ? '#1e8e3e' : '#d93025'
                          }}>
                            {msg.source === 'item_list' ? 'Inquiry' : 'Contact'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', maxWidth: '300px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: msg.read ? '#555' : '#000', fontSize: '0.9rem' }}>
                            {msg.message || 'No message provided...'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setMessageToDelete(msg._id);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: '#d93025', borderColor: '#fce8e6', background: '#fff9f9' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* MESSAGE VIEW MODAL */}
            {expandedMessageId && messages.find(m => m._id === expandedMessageId) && createPortal(
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
              }}>
                <div style={{
                  background: 'white', borderRadius: '12px', padding: '2rem', 
                  width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                  {(() => {
                    const msg = messages.find(m => m._id === expandedMessageId);
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <h2 style={{ margin: 0 }}>Message Details</h2>
                          <button onClick={() => setExpandedMessageId(null)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>Close</button>
                        </div>

                        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.8rem', alignItems: 'center' }}>
                            <strong style={{ color: '#666' }}>Sender:</strong>
                            <div>{msg.name}</div>
                            
                            <strong style={{ color: '#666' }}>Email:</strong>
                            <div>{msg.email}</div>
                            
                            <strong style={{ color: '#666' }}>Contact:</strong>
                            <div>{msg.mobile || 'N/A'}</div>

                            <strong style={{ color: '#666' }}>Volume/Order Qty:</strong>
                            <div>{msg.quantity || 'N/A'}</div>

                            <strong style={{ color: '#666' }}>Date:</strong>
                            <div>{new Date(msg.createdAt).toLocaleString()}</div>
                          </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                          <strong style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Message</strong>
                          <div style={{ background: '#faf9f6', padding: '1rem', borderRadius: '8px', border: '1px solid #eaeaea', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                            {msg.message || 'No additional message provided.'}
                          </div>
                        </div>

                        {msg.items && msg.items.length > 0 && (
                          <div>
                            <strong style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Requested Items</strong>
                            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #eaeaea', textAlign: 'left' }}>
                                    <th style={{ padding: '0.8rem' }}>Item</th>
                                    <th style={{ padding: '0.8rem' }}>Item #</th>
                                    <th style={{ padding: '0.8rem', textAlign: 'center' }}>Quantity</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {msg.items.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: idx !== msg.items.length - 1 ? '1px solid #eaeaea' : 'none' }}>
                                      <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{item.name}</td>
                                      <td style={{ padding: '0.8rem', color: '#666', fontFamily: 'monospace' }}>{item.itemNumber || 'N/A'}</td>
                                      <td style={{ padding: '0.8rem', textAlign: 'center' }}>{item.requestedQuantity || item.quantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            , document.body)}
          </div>
        )}

        {/* MANAGE ADMIN TAB */}
        {activeTab === 'manage-admin' && isMainAdmin && (
          <div>
            <div style={{ position: 'sticky', top: 0, background: '#faf9f6', paddingTop: '3rem', paddingBottom: '1.5rem', zIndex: 10, margin: '0 -3rem 2rem -3rem', paddingLeft: '3rem', paddingRight: '3rem' }}>
              <h1 style={{ marginBottom: '0.5rem', marginTop: 0 }}>Manage Admin Users</h1>
              <p style={{ margin: 0, color: '#666' }}>Grant or revoke admin access for other Google accounts.</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <button onClick={() => setIsAddAdminPopupOpen(true)} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>ADD ADMIN</button>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #eaeaea', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', fontWeight: '600' }}>Email Address</th>
                    <th style={{ padding: '1rem', fontWeight: '600' }}>Added On</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #eaeaea' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: '#333' }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleRemoveAdmin(user._id)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: '#d93025', borderColor: '#fce8e6', background: '#fff9f9' }}
                        >
                          Remove Access
                        </button>
                      </td>
                    </tr>
                  ))}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        No additional admin users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ADD ADMIN MODAL */}
      {isAddAdminPopupOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '2rem', 
            width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Add New Admin</h3>
              <button onClick={() => {setIsAddAdminPopupOpen(false); setNewAdminEmail('');}} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="email" 
                placeholder="Enter Google Email Address" 
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
                style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => {setIsAddAdminPopupOpen(false); setNewAdminEmail('');}} className="btn btn-outline" style={{ padding: '0.8rem 1.5rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>Add Admin</button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}

      {/* PRODUCT SELECTION MODAL */}
      {selectingProductFor && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Select a Product</h2>
              <button onClick={() => setSelectingProductFor(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <p style={{ marginBottom: '1.5rem', color: '#666', fontWeight: 'bold' }}>
              Click any product from your catalog to swap it into this slot.
            </p>

            <div style={{ overflowY: 'auto', flex: 1, borderTop: '1px solid #eee', paddingTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {products
                .filter(p => selectingProductFor.type === 'category' ? p.categoryId === selectingProductFor.categoryId : true)
                .map(product => {
                return (
                  <div 
                    key={product.id}
                    onClick={() => {
                      if (selectingProductFor.type === 'category') {
                        const { categoryId, slotIndex } = selectingProductFor;
                        const currentSelections = [...(homepageData.categoryFeaturedItems?.[categoryId] || [])];
                        currentSelections[slotIndex] = product.id;
                        
                        setHomepageData({
                          ...homepageData,
                          categoryFeaturedItems: {
                            ...homepageData.categoryFeaturedItems,
                            [categoryId]: currentSelections
                          }
                        });
                      } else if (selectingProductFor.type === 'promo') {
                        const { slotIndex } = selectingProductFor;
                        const newCards = [...homepageData.promoCards];
                        newCards[slotIndex].image = product.image;
                        setHomepageData({ ...homepageData, promoCards: newCards });
                      }
                      
                      setSelectingProductFor(null);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', background: 'transparent', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e0e0e0' }}
                  >
                    <div style={{ width: '100%', height: '150px', background: '#e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                       {product.image && (
                         <AdvancedImage 
                           cldImg={cld.image(product.image).resize(fill().width(200).height(200))} 
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                         />
                       )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'monospace' }}>{product.itemNumber}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectingProductFor(null)} className="btn btn-outline" style={{ padding: '0.5rem 2rem' }}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* DELETE MESSAGE CONFIRMATION MODAL */}
      {messageToDelete && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '2rem', 
            width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--color-primary)' }}>Confirm Deletion</h3>
            <p style={{ marginBottom: '2rem', color: '#666' }}>Are you sure you want to delete this message? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setMessageToDelete(null)} 
                className="btn btn-outline" 
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteMessage(messageToDelete)} 
                className="btn btn-primary" 
                style={{ padding: '0.6rem 1.5rem', background: '#d93025', borderColor: '#d93025' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {productToDelete && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '2rem', 
            width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--color-primary)' }}>Confirm Product Deletion</h3>
            <p style={{ marginBottom: '2rem', color: '#666' }}>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setProductToDelete(null)} 
                className="btn btn-outline" 
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteProduct(productToDelete)} 
                className="btn btn-primary" 
                style={{ padding: '0.6rem 1.5rem', background: '#d93025', borderColor: '#d93025' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* DELETE CATEGORY CONFIRMATION MODAL */}
      {categoryToDelete && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '2rem', 
            width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--color-primary)' }}>Confirm Collection Deletion</h3>
            <p style={{ marginBottom: '2rem', color: '#666' }}>Are you sure you want to delete this collection? This will permanently remove the tab from your website. Products within this collection will remain but won't be easily visible unless reassigned.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setCategoryToDelete(null)} 
                className="btn btn-outline" 
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteCategory(categoryToDelete)} 
                className="btn btn-primary" 
                style={{ padding: '0.6rem 1.5rem', background: '#d93025', borderColor: '#d93025' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Admin;

