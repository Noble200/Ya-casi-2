// src/components/panels/Harvests/HarvestDialog.js - Actualizado con selección de productos
import React, { useState, useEffect } from 'react';

const HarvestDialog = ({ harvest, fields, selectedField, selectedLots, products, warehouses, isNew, onSave, onClose }) => {
  // Estado inicial para el formulario
  const [formData, setFormData] = useState({
    field: { id: '', name: '' },
    fieldId: '',
    crop: '',
    lots: [],
    totalArea: 0,
    areaUnit: 'ha',
    plannedDate: '',
    status: 'pending',
    estimatedYield: '',
    yieldUnit: 'kg/ha',
    harvestMethod: '',
    machinery: [],
    workers: '',
    targetWarehouse: '',
    qualityParameters: [],
    notes: '',
    // NUEVO: Productos a cosechar
    productsToHarvest: [],
    productFilter: {
      level: 'field', // 'field', 'lot', 'warehouse'
      selectedId: ''
    }
  });

  // Estado para campos adicionales
  const [availableLots, setAvailableLots] = useState([]);
  const [availableWarehouses, setAvailableWarehouses] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showAllFields, setShowAllFields] = useState(!selectedField);
  const [machineryInput, setMachineryInput] = useState('');
  const [qualityParamInput, setQualityParamInput] = useState({ name: '', value: '', unit: '' });
  const [errors, setErrors] = useState({});

  // Cargar datos de la cosecha si estamos editando
  useEffect(() => {
    if (harvest && !isNew) {
      setFormData({
        field: harvest.field || { id: '', name: '' },
        fieldId: harvest.field?.id || '',
        crop: harvest.crop || '',
        lots: harvest.lots || [],
        totalArea: harvest.totalArea || 0,
        areaUnit: harvest.areaUnit || 'ha',
        plannedDate: formatDateForInput(harvest.plannedDate),
        status: harvest.status || 'pending',
        estimatedYield: harvest.estimatedYield || '',
        yieldUnit: harvest.yieldUnit || 'kg/ha',
        harvestMethod: harvest.harvestMethod || '',
        machinery: harvest.machinery || [],
        workers: harvest.workers || '',
        targetWarehouse: harvest.targetWarehouse || '',
        qualityParameters: harvest.qualityParameters || [],
        notes: harvest.notes || '',
        productsToHarvest: harvest.productsToHarvest || [],
        productFilter: {
          level: 'field',
          selectedId: harvest.field?.id || ''
        }
      });
      
      // Si hay un campo seleccionado, cargar sus lotes
      if (harvest.field) {
        const field = fields.find(f => f.id === harvest.field.id);
        if (field) {
          setAvailableLots(field.lots || []);
          loadWarehousesForField(field.id);
          loadProductsForFilter('field', field.id);
        }
      }
    } else if (selectedField) {
      // Si hay un campo preseleccionado al crear una nueva cosecha
      const field = fields.find(f => f.id === selectedField.id);
      if (field) {
        setFormData(prev => ({
          ...prev,
          field: { id: field.id, name: field.name },
          fieldId: field.id,
          lots: selectedLots || [],
          totalArea: calculateTotalArea(selectedLots || []),
          areaUnit: field.areaUnit || 'ha',
          crop: field.crops && field.crops.length > 0 ? field.crops[0] : '',
          productFilter: {
            level: 'field',
            selectedId: field.id
          }
        }));
        
        setAvailableLots(field.lots || []);
        setShowAllFields(false);
        loadWarehousesForField(field.id);
        loadProductsForFilter('field', field.id);
      }
    }
  }, [harvest, isNew, fields, selectedField, selectedLots, products]);

  // Formatear fecha para input de tipo date
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    const d = date.seconds
      ? new Date(date.seconds * 1000)
      : new Date(date);
    
    return d.toISOString().split('T')[0];
  };

  // Calcular superficie total de lotes seleccionados
  const calculateTotalArea = (lots) => {
    if (!lots || lots.length === 0) return 0;
    
    return lots.reduce((total, lot) => {
      const area = lot.area || 0;
      return total + Number(area);
    }, 0);
  };

  // Cargar almacenes para un campo específico
  const loadWarehousesForField = (fieldId) => {
    if (!fieldId) {
      setAvailableWarehouses([]);
      return;
    }
    
    const fieldWarehouses = warehouses.filter(w => w.fieldId === fieldId);
    setAvailableWarehouses(fieldWarehouses);
  };

  // Cargar productos según el filtro seleccionado
  const loadProductsForFilter = (level, selectedId) => {
    if (!selectedId) {
      setAvailableProducts([]);
      return;
    }

    let filteredProducts = [];

    // Filtrar productos que son cosechables (semillas, cultivos)
    const harvestableCategories = ['semilla', 'fertilizante', 'pesticida'];
    
    switch (level) {
      case 'field':
        filteredProducts = products.filter(p => 
          p.fieldId === selectedId && 
          p.stock > 0 &&
          harvestableCategories.includes(p.category)
        );
        break;
      case 'lot':
        filteredProducts = products.filter(p => 
          p.lotId === selectedId && 
          p.stock > 0 &&
          harvestableCategories.includes(p.category)
        );
        break;
      case 'warehouse':
        filteredProducts = products.filter(p => 
          p.warehouseId === selectedId && 
          p.stock > 0 &&
          harvestableCategories.includes(p.category)
        );
        break;
      default:
        filteredProducts = [];
    }

    setAvailableProducts(filteredProducts);
  };

  // Manejar cambio de campo seleccionado
  const handleFieldChange = (e) => {
    const fieldId = e.target.value;
    
    if (fieldId) {
      const selectedField = fields.find(f => f.id === fieldId);
      if (selectedField) {
        setFormData(prev => ({
          ...prev,
          field: { id: selectedField.id, name: selectedField.name },
          fieldId: selectedField.id,
          lots: [],
          totalArea: 0,
          areaUnit: selectedField.areaUnit || 'ha',
          crop: selectedField.crops && selectedField.crops.length > 0 
            ? selectedField.crops[0] 
            : prev.crop,
          productsToHarvest: [], // Limpiar productos seleccionados
          productFilter: { level: 'field', selectedId: fieldId }
        }));
        
        setAvailableLots(selectedField.lots || []);
        loadWarehousesForField(fieldId);
        loadProductsForFilter('field', fieldId);
        
        if (errors.fieldId) {
          setErrors(prev => ({ ...prev, fieldId: '' }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        field: { id: '', name: '' },
        fieldId: '',
        lots: [],
        totalArea: 0,
        productsToHarvest: [],
        productFilter: { level: 'field', selectedId: '' }
      }));
      setAvailableLots([]);
      setAvailableWarehouses([]);
      setAvailableProducts([]);
    }
  };

  // Manejar cambio en filtro de productos
  const handleProductFilterChange = (field, value) => {
    const newFilter = { ...formData.productFilter, [field]: value };
    
    setFormData(prev => ({
      ...prev,
      productFilter: newFilter,
      productsToHarvest: [] // Limpiar productos seleccionados
    }));

    if (field === 'level') {
      // Si cambia el nivel, limpiar la selección
      newFilter.selectedId = '';
      setAvailableProducts([]);
    } else if (field === 'selectedId') {
      // Si cambia la selección, cargar productos
      loadProductsForFilter(newFilter.level, value);
    }
  };

  // Manejar selección/deselección de lotes
  const handleLotToggle = (lot) => {
    setFormData(prev => {
      const isSelected = prev.lots.some(l => l.id === lot.id);
      
      let updatedLots;
      if (isSelected) {
        updatedLots = prev.lots.filter(l => l.id !== lot.id);
      } else {
        updatedLots = [...prev.lots, lot];
      }
      
      const totalArea = calculateTotalArea(updatedLots);
      
      return {
        ...prev,
        lots: updatedLots,
        totalArea
      };
    });
    
    if (errors.lots) {
      setErrors(prev => ({ ...prev, lots: '' }));
    }
  };

  // Manejar selección de productos
  const handleProductToggle = (product) => {
    setFormData(prev => {
      const isSelected = prev.productsToHarvest.some(p => p.id === product.id);
      
      let updatedProducts;
      if (isSelected) {
        updatedProducts = prev.productsToHarvest.filter(p => p.id !== product.id);
      } else {
        // Añadir producto con cantidad a cosechar
        updatedProducts = [...prev.productsToHarvest, {
          ...product,
          quantityToHarvest: 0,
          maxQuantity: product.stock
        }];
      }
      
      return {
        ...prev,
        productsToHarvest: updatedProducts
      };
    });
  };

  // Manejar cambio en cantidad a cosechar
  const handleQuantityChange = (productId, quantity) => {
    setFormData(prev => ({
      ...prev,
      productsToHarvest: prev.productsToHarvest.map(p => 
        p.id === productId 
          ? { ...p, quantityToHarvest: Math.min(Math.max(0, Number(quantity)), p.maxQuantity) }
          : p
      )
    }));
  };

  // Manejar cambios generales en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'crop' && errors.crop) {
      setErrors(prev => ({ ...prev, crop: '' }));
    }
    
    if (name === 'plannedDate' && errors.plannedDate) {
      setErrors(prev => ({ ...prev, plannedDate: '' }));
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar adición de maquinaria
  const handleAddMachinery = () => {
    if (machineryInput.trim()) {
      setFormData(prev => ({
        ...prev,
        machinery: [...prev.machinery, machineryInput.trim()]
      }));
      setMachineryInput('');
    }
  };

  // Manejar eliminación de maquinaria
  const handleRemoveMachinery = (index) => {
    setFormData(prev => ({
      ...prev,
      machinery: prev.machinery.filter((_, i) => i !== index)
    }));
  };

  // Manejar adición de parámetro de calidad
  const handleAddQualityParam = () => {
    if (qualityParamInput.name.trim() && qualityParamInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        qualityParameters: [...prev.qualityParameters, { ...qualityParamInput }]
      }));
      setQualityParamInput({ name: '', value: '', unit: '' });
    }
  };

  // Manejar eliminación de parámetro de calidad
  const handleRemoveQualityParam = (index) => {
    setFormData(prev => ({
      ...prev,
      qualityParameters: prev.qualityParameters.filter((_, i) => i !== index)
    }));
  };

  // Validar formulario antes de guardar
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fieldId) {
      newErrors.fieldId = 'Debe seleccionar un campo';
    }
    
    if (!formData.crop.trim()) {
      newErrors.crop = 'El cultivo es obligatorio';
    }
    
    if (formData.lots.length === 0) {
      newErrors.lots = 'Debe seleccionar al menos un lote';
    }
    
    if (!formData.plannedDate) {
      newErrors.plannedDate = 'La fecha planificada es obligatoria';
    }

    // Validar productos a cosechar
    if (formData.productsToHarvest.length > 0) {
      const hasInvalidQuantities = formData.productsToHarvest.some(p => 
        p.quantityToHarvest <= 0 || p.quantityToHarvest > p.maxQuantity
      );
      
      if (hasInvalidQuantities) {
        newErrors.productsToHarvest = 'Las cantidades a cosechar deben ser válidas';
      }
    }
    
    if (formData.estimatedYield && isNaN(Number(formData.estimatedYield))) {
      newErrors.estimatedYield = 'El rendimiento estimado debe ser un número';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Estado para el loading
  const [submitting, setSubmitting] = useState(false);

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitting(true);
      
      // Preparar datos para guardar
      const harvestData = {
        ...formData,
        estimatedYield: formData.estimatedYield ? Number(formData.estimatedYield) : null,
        totalArea: Number(formData.totalArea)
      };
      
      // Convertir fechas a objetos Date
      if (harvestData.plannedDate) {
        harvestData.plannedDate = new Date(harvestData.plannedDate);
      }
      
      onSave(harvestData)
        .catch(error => {
          console.error("Error al guardar cosecha:", error);
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  return (
    <div className="dialog harvest-dialog">
      <div className="dialog-header">
        <h2 className="dialog-title">
          {isNew ? 'Añadir nueva cosecha' : 'Editar cosecha'}
        </h2>
        <button className="dialog-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="dialog-body">
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Sección principal */}
            <div className="form-section">
              <h3 className="section-title">Información básica</h3>
              
              {/* Campo - solo si no hay campo preseleccionado o showAllFields=true */}
              {showAllFields && (
                <div className="form-group">
                  <label htmlFor="fieldId" className="form-label required">Campo</label>
                  <select
                    id="fieldId"
                    name="fieldId"
                    className={`form-control ${errors.fieldId ? 'is-invalid' : ''}`}
                    value={formData.fieldId}
                    onChange={handleFieldChange}
                    style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                    disabled={!isNew || submitting}
                  >
                    <option value="">Seleccionar campo</option>
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                  {errors.fieldId && <div className="invalid-feedback">{errors.fieldId}</div>}
                </div>
              )}
              
              {/* Cultivo */}
              <div className="form-group">
                <label htmlFor="crop" className="form-label required">Cultivo</label>
                <input
                  type="text"
                  id="crop"
                  name="crop"
                  className={`form-control ${errors.crop ? 'is-invalid' : ''}`}
                  value={formData.crop}
                  onChange={handleChange}
                  placeholder="Ej: Maíz, Soja, Trigo..."
                  disabled={submitting}
                />
                {errors.crop && <div className="invalid-feedback">{errors.crop}</div>}
              </div>
              
              {/* Fecha planificada */}
              <div className="form-group">
                <label htmlFor="plannedDate" className="form-label required">Fecha planificada</label>
                <input
                  type="date"
                  id="plannedDate"
                  name="plannedDate"
                  className={`form-control ${errors.plannedDate ? 'is-invalid' : ''}`}
                  value={formData.plannedDate}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.plannedDate && <div className="invalid-feedback">{errors.plannedDate}</div>}
              </div>
              
              {/* Estado */}
              <div className="form-group">
                <label htmlFor="status" className="form-label">Estado</label>
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                  disabled={submitting}
                >
                  <option value="pending">Pendiente</option>
                  <option value="scheduled">Programada</option>
                  <option value="in_progress">En proceso</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>
            
            {/* Sección de lotes */}
            <div className="form-section">
              <h3 className="section-title">Selección de lotes</h3>
              
              {formData.fieldId ? (
                <>
                  <div className={`lots-selection ${errors.lots ? 'is-invalid' : ''}`}>
                    {availableLots.length > 0 ? (
                      <>
                        <div className="lots-selection-header">
                          <span className="selection-label">Seleccione los lotes para cosechar</span>
                          <span className="selection-counter">
                            {formData.lots.length} de {availableLots.length} seleccionados
                          </span>
                        </div>
                        
                        <div className="lots-grid">
                          {availableLots.map((lot) => {
                            const isSelected = formData.lots.some(l => l.id === lot.id);
                            return (
                              <div 
                                key={lot.id} 
                                className={`lot-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleLotToggle(lot)}
                              >
                                <div className="lot-checkbox">
                                  <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={() => {}}
                                    disabled={submitting}
                                  />
                                </div>
                                <div className="lot-info">
                                  <div className="lot-name">{lot.name}</div>
                                  <div className="lot-details">
                                    <span>{lot.area} {lot.areaUnit || formData.areaUnit}</span>
                                    {lot.crops && lot.crops.length > 0 && (
                                      <span>Cultivo: {lot.crops[0]}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="selected-area">
                          <span className="area-label">Superficie total seleccionada:</span>
                          <span className="area-value">{formData.totalArea} {formData.areaUnit}</span>
                        </div>
                      </>
                    ) : (
                      <div className="empty-lots-message">
                        <p>No hay lotes disponibles en este campo.</p>
                        <p>Debe agregar lotes al campo antes de programar una cosecha.</p>
                      </div>
                    )}
                  </div>
                  {errors.lots && <div className="invalid-feedback">{errors.lots}</div>}
                </>
              ) : (
                <div className="select-field-message">
                  <p>Seleccione un campo para ver los lotes disponibles.</p>
                </div>
              )}
            </div>
            
            {/* NUEVA SECCIÓN: Selección de productos a cosechar */}
            <div className="form-section">
              <h3 className="section-title">Productos a cosechar</h3>
              
              <div className="product-filter-container">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Filtrar productos por:</label>
                    <select
                      className="form-control"
                      value={formData.productFilter.level}
                      onChange={(e) => handleProductFilterChange('level', e.target.value)}
                      style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                      disabled={submitting}
                    >
                      <option value="field">Campo completo</option>
                      <option value="lot">Lote específico</option>
                      <option value="warehouse">Almacén específico</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Seleccionar:</label>
                    <select
                      className="form-control"
                      value={formData.productFilter.selectedId}
                      onChange={(e) => handleProductFilterChange('selectedId', e.target.value)}
                      style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                      disabled={submitting}
                    >
                      <option value="">Seleccionar {formData.productFilter.level}</option>
                      {formData.productFilter.level === 'field' && fields.map(field => (
                        <option key={field.id} value={field.id}>{field.name}</option>
                      ))}
                      {formData.productFilter.level === 'lot' && availableLots.map(lot => (
                        <option key={lot.id} value={lot.id}>{lot.name}</option>
                      ))}
                      {formData.productFilter.level === 'warehouse' && availableWarehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Lista de productos disponibles */}
              {availableProducts.length > 0 ? (
                <div className="products-selection">
                  <div className="products-selection-header">
                    <span className="selection-label">Productos disponibles para cosechar</span>
                    <span className="selection-counter">
                      {formData.productsToHarvest.length} seleccionados
                    </span>
                  </div>
                  
                  <div className="products-grid">
                    {availableProducts.map((product) => {
                      const isSelected = formData.productsToHarvest.some(p => p.id === product.id);
                      const selectedProduct = formData.productsToHarvest.find(p => p.id === product.id);
                      
                      return (
                        <div 
                          key={product.id} 
                          className={`product-item ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="product-checkbox">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleProductToggle(product)}
                              disabled={submitting}
                            />
                          </div>
                          <div className="product-info">
                            <div className="product-name">{product.name}</div>
                            <div className="product-details">
                              <span>Stock: {product.stock} {product.unit}</span>
                              <span>Almacenamiento: {product.storageType}</span>
                              {product.lotNumber && <span>Lote: {product.lotNumber}</span>}
                            </div>
                            
                            {isSelected && (
                              <div className="quantity-input">
                                <label>Cantidad a cosechar:</label>
                                <div className="quantity-controls">
                                  <input
                                    type="number"
                                    min="0"
                                    max={product.stock}
                                    step="0.01"
                                    value={selectedProduct?.quantityToHarvest || 0}
                                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                    className="form-control"
                                    disabled={submitting}
                                  />
                                  <span className="unit-label">{product.unit}</span>
                                </div>
                                <span className="max-quantity">Máximo: {product.stock} {product.unit}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : formData.productFilter.selectedId ? (
                <div className="empty-products-message">
                  <p>No hay productos cosechables disponibles en la ubicación seleccionada.</p>
                </div>
              ) : (
                <div className="select-location-message">
                  <p>Seleccione una ubicación para ver los productos disponibles.</p>
                </div>
              )}
              
              {errors.productsToHarvest && <div className="invalid-feedback">{errors.productsToHarvest}</div>}
            </div>
            
            {/* Sección de rendimiento y métodos */}
            <div className="form-section">
              <h3 className="section-title">Rendimiento y método de cosecha</h3>
              
              {/* Rendimiento estimado */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor="estimatedYield" className="form-label">Rendimiento estimado</label>
                  <input
                    type="text"
                    id="estimatedYield"
                    name="estimatedYield"
                    className={`form-control ${errors.estimatedYield ? 'is-invalid' : ''}`}
                    value={formData.estimatedYield}
                    onChange={handleChange}
                    placeholder="Ej: 8500"
                    disabled={submitting}
                  />
                  {errors.estimatedYield && <div className="invalid-feedback">{errors.estimatedYield}</div>}
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="yieldUnit" className="form-label">Unidad</label>
                  <select
                    id="yieldUnit"
                    name="yieldUnit"
                    className="form-control"
                    value={formData.yieldUnit}
                    onChange={handleChange}
                    style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                    disabled={submitting}
                  >
                    <option value="kg/ha">kg/ha</option>
                    <option value="ton/ha">ton/ha</option>
                    <option value="qq/ha">qq/ha</option>
                  </select>
                </div>
              </div>
              
              {/* Método de cosecha */}
              <div className="form-group">
                <label htmlFor="harvestMethod" className="form-label">Método de cosecha</label>
                <select
                  id="harvestMethod"
                  name="harvestMethod"
                  className="form-control"
                  value={formData.harvestMethod}
                  onChange={handleChange}
                  style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                  disabled={submitting}
                >
                  <option value="">Seleccionar método</option>
                  <option value="manual">Manual</option>
                  <option value="mechanical">Mecánica</option>
                  <option value="combined">Combinada</option>
                </select>
              </div>
              
              {/* Maquinaria */}
              <div className="form-group">
                <label htmlFor="machinery" className="form-label">Maquinaria a utilizar</label>
                
                <div className="input-with-button">
                  <input
                    type="text"
                    id="machineryInput"
                    className="form-control"
                    value={machineryInput}
                    onChange={(e) => setMachineryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMachinery())}
                    placeholder="Añadir maquinaria"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={handleAddMachinery}
                    disabled={submitting}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                
                {formData.machinery && formData.machinery.length > 0 ? (
                  <div className="tags-container">
                    {formData.machinery.map((item, index) => (
                      <div key={index} className="tag">
                        {item}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemoveMachinery(index)}
                          disabled={submitting}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-tags-message">No hay maquinaria añadida</div>
                )}
              </div>
              
              {/* Personal */}
              <div className="form-group">
                <label htmlFor="workers" className="form-label">Personal necesario</label>
                <input
                  type="text"
                  id="workers"
                  name="workers"
                  className="form-control"
                  value={formData.workers}
                  onChange={handleChange}
                  placeholder="Ej: 3 operarios, 1 supervisor"
                  disabled={submitting}
                />
              </div>
            </div>
            
            {/* Sección de almacenamiento y calidad */}
            <div className="form-section">
              <h3 className="section-title">Almacenamiento y parámetros de calidad</h3>
              
              {/* Almacén destino */}
              <div className="form-group">
                <label htmlFor="targetWarehouse" className="form-label">Almacén destino</label>
                <input
                  type="text"
                  id="targetWarehouse"
                  name="targetWarehouse"
                  className="form-control"
                  value={formData.targetWarehouse}
                  onChange={handleChange}
                  placeholder="Ej: Silo principal, Almacén central"
                  disabled={submitting}
                />
              </div>
              
              {/* Parámetros de calidad */}
              <div className="form-group">
                <label className="form-label">Parámetros de calidad</label>
                
                <div className="quality-params-grid">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={qualityParamInput.name}
                    onChange={(e) => setQualityParamInput(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Parámetro"
                    disabled={submitting}
                  />
                  
                  <input
                    type="text"
                    name="value"
                    className="form-control"
                    value={qualityParamInput.value}
                    onChange={(e) => setQualityParamInput(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Valor"
                    disabled={submitting}
                  />
                  
                  <input
                    type="text"
                    name="unit"
                    className="form-control"
                    value={qualityParamInput.unit}
                    onChange={(e) => setQualityParamInput(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="Unidad"
                    disabled={submitting}
                  />
                  
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={handleAddQualityParam}
                    disabled={submitting || !qualityParamInput.name || !qualityParamInput.value}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                
                {formData.qualityParameters && formData.qualityParameters.length > 0 ? (
                  <div className="quality-params-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Parámetro</th>
                          <th>Valor</th>
                          <th>Unidad</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.qualityParameters.map((param, index) => (
                          <tr key={index}>
                            <td>{param.name}</td>
                            <td>{param.value}</td>
                            <td>{param.unit}</td>
                            <td>
                              <button
                                type="button"
                                className="btn-icon btn-icon-sm btn-icon-danger"
                                onClick={() => handleRemoveQualityParam(index)}
                                disabled={submitting}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-table-message">No hay parámetros de calidad definidos</div>
                )}
              </div>
            </div>
            
            {/* Notas */}
            <div className="form-section">
              <h3 className="section-title">Notas adicionales</h3>
              
              <div className="form-group">
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Notas adicionales sobre la cosecha"
                  rows={4}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div className="dialog-footer">
        <button className="btn btn-outline" onClick={onClose} disabled={submitting}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm mr-2"></span>
              {isNew ? 'Creando...' : 'Guardando...'}
            </>
          ) : (
            isNew ? 'Crear cosecha' : 'Guardar cambios'
          )}
        </button>
      </div>
    </div>
  );
};

export default HarvestDialog;