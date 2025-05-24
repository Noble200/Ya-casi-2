// src/components/panels/Harvests/HarvestDialog.js - Formulario para crear/editar cosecha con productos
import React, { useState, useEffect } from 'react';

const HarvestDialog = ({ 
  harvest, 
  fields, 
  products,
  warehouses,
  preselectedField, 
  preselectedLots, 
  isNew, 
  onSave, 
  onClose 
}) => {
  // Estado inicial para el formulario
  const [formData, setFormData] = useState({
    fieldId: '',
    field: null,
    crop: '',
    lots: [],
    totalArea: '',
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
    // Nuevos campos para productos
    selectedProducts: []
  });

  // Estados adicionales
  const [availableLots, setAvailableLots] = useState([]);
  const [selectedLotIds, setSelectedLotIds] = useState([]);
  const [machineryInput, setMachineryInput] = useState('');
  const [qualityInput, setQualityInput] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    if (harvest && !isNew) {
      // Editando cosecha existente
      setFormData({
        fieldId: harvest.fieldId || '',
        field: harvest.field || null,
        crop: harvest.crop || '',
        lots: harvest.lots || [],
        totalArea: harvest.totalArea || '',
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
        selectedProducts: harvest.selectedProducts || []
      });
      
      // Cargar lotes del campo seleccionado
      if (harvest.fieldId) {
        const field = fields.find(f => f.id === harvest.fieldId);
        if (field && field.lots) {
          setAvailableLots(field.lots);
          setSelectedLotIds(harvest.lots.map(lot => lot.id));
        }
      }
    } else if (preselectedField) {
      // Nueva cosecha desde un campo preseleccionado
      const fieldData = {
        id: preselectedField.id,
        name: preselectedField.name
      };
      
      setFormData(prev => ({
        ...prev,
        fieldId: preselectedField.id,
        field: fieldData,
        crop: preselectedField.currentCrop || preselectedField.crops?.[0] || '',
        lots: preselectedLots || []
      }));
      
      if (preselectedField.lots) {
        setAvailableLots(preselectedField.lots);
        if (preselectedLots && preselectedLots.length > 0) {
          setSelectedLotIds(preselectedLots.map(lot => lot.id));
        }
      }
    }
  }, [harvest, fields, isNew, preselectedField, preselectedLots]);

  // Cargar productos disponibles cuando se selecciona un campo
  useEffect(() => {
    if (formData.fieldId) {
      // Filtrar productos del campo seleccionado
      const fieldProducts = products.filter(p => p.fieldId === formData.fieldId && p.stock > 0);
      setAvailableProducts(fieldProducts);
    } else {
      setAvailableProducts([]);
    }
  }, [formData.fieldId, products]);

  // Formatear fecha para input de tipo date
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    const d = date.seconds
      ? new Date(date.seconds * 1000)
      : new Date(date);
    
    return d.toISOString().split('T')[0];
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limpiar errores al modificar el campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si cambia el campo, actualizar lotes disponibles
    if (name === 'fieldId') {
      const field = fields.find(f => f.id === value);
      if (field) {
        setFormData(prev => ({
          ...prev,
          fieldId: value,
          field: { id: field.id, name: field.name },
          crop: field.currentCrop || field.crops?.[0] || prev.crop
        }));
        setAvailableLots(field.lots || []);
        setSelectedLotIds([]);
      } else {
        setAvailableLots([]);
      }
    }
  };

  // Manejar selección de lotes
  const handleLotSelection = (lotId) => {
    setSelectedLotIds(prev => {
      if (prev.includes(lotId)) {
        return prev.filter(id => id !== lotId);
      } else {
        return [...prev, lotId];
      }
    });
  };

  // Actualizar lotes seleccionados en formData
  useEffect(() => {
    const selectedLots = availableLots.filter(lot => selectedLotIds.includes(lot.id));
    const totalArea = selectedLots.reduce((sum, lot) => sum + (lot.area || 0), 0);
    
    setFormData(prev => ({
      ...prev,
      lots: selectedLots,
      totalArea: totalArea > 0 ? totalArea.toString() : prev.totalArea
    }));
  }, [selectedLotIds, availableLots]);

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
  const handleAddQuality = () => {
    if (qualityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        qualityParameters: [...prev.qualityParameters, qualityInput.trim()]
      }));
      setQualityInput('');
    }
  };

  // Manejar eliminación de parámetro de calidad
  const handleRemoveQuality = (index) => {
    setFormData(prev => ({
      ...prev,
      qualityParameters: prev.qualityParameters.filter((_, i) => i !== index)
    }));
  };

  // Manejar selección de productos
  const handleAddProduct = (productId) => {
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      const existingProduct = formData.selectedProducts.find(sp => sp.productId === productId);
      if (!existingProduct) {
        setFormData(prev => ({
          ...prev,
          selectedProducts: [...prev.selectedProducts, {
            productId: product.id,
            productName: product.name,
            quantity: 0,
            unit: product.unit,
            availableStock: product.stock
          }]
        }));
      }
    }
    setShowProductSelector(false);
  };

  // Actualizar cantidad de producto seleccionado
  const handleProductQuantityChange = (productId, quantity) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map(sp => 
        sp.productId === productId 
          ? { ...sp, quantity: Number(quantity) || 0 }
          : sp
      )
    }));
  };

  // Eliminar producto seleccionado
  const handleRemoveProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(sp => sp.productId !== productId)
    }));
  };

  // Validar formulario antes de guardar
  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obligatorios
    if (!formData.fieldId) {
      newErrors.fieldId = 'El campo es obligatorio';
    }
    
    if (!formData.crop.trim()) {
      newErrors.crop = 'El cultivo es obligatorio';
    }
    
    if (!formData.plannedDate) {
      newErrors.plannedDate = 'La fecha planificada es obligatoria';
    }
    
    if (formData.totalArea && isNaN(Number(formData.totalArea))) {
      newErrors.totalArea = 'La superficie debe ser un número';
    }
    
    if (formData.estimatedYield && isNaN(Number(formData.estimatedYield))) {
      newErrors.estimatedYield = 'El rendimiento debe ser un número';
    }

    // Validar cantidades de productos
    const invalidProducts = formData.selectedProducts.filter(sp => 
      sp.quantity > sp.availableStock
    );
    
    if (invalidProducts.length > 0) {
      newErrors.products = 'Algunos productos exceden el stock disponible';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitting(true);
      
      // Preparar datos para guardar
      const harvestData = {
        ...formData,
        totalArea: formData.totalArea ? Number(formData.totalArea) : 0,
        estimatedYield: formData.estimatedYield ? Number(formData.estimatedYield) : 0,
        plannedDate: formData.plannedDate ? new Date(formData.plannedDate) : null
      };
      
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
          {isNew ? 'Planificar nueva cosecha' : 'Editar cosecha'}
        </h2>
        <button className="dialog-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="dialog-body">
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Información básica */}
            <div className="form-section">
              <h3 className="section-title">Información básica</h3>
              
              <div className="form-grid">
                {/* Campo */}
                <div className="form-group">
                  <label htmlFor="fieldId" className="form-label required">Campo</label>
                  <select
                    id="fieldId"
                    name="fieldId"
                    className={`form-control ${errors.fieldId ? 'is-invalid' : ''}`}
                    value={formData.fieldId}
                    onChange={handleChange}
                    disabled={submitting || !!preselectedField}
                    style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
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
                    placeholder="Tipo de cultivo"
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
                    disabled={submitting}
                    style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="scheduled">Programada</option>
                    <option value="in_progress">En proceso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>
              
              {/* Selección de lotes */}
              {formData.fieldId && availableLots.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Lotes a cosechar</label>
                  <div className="lots-selection">
                    {availableLots.map((lot) => (
                      <div key={lot.id} className="lot-checkbox">
                        <input
                          type="checkbox"
                          id={`lot-${lot.id}`}
                          checked={selectedLotIds.includes(lot.id)}
                          onChange={() => handleLotSelection(lot.id)}
                          disabled={submitting}
                        />
                        <label htmlFor={`lot-${lot.id}`}>
                          {lot.name} ({lot.area} {lot.areaUnit || 'ha'})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Información de rendimiento */}
            <div className="form-section">
              <h3 className="section-title">Información de rendimiento</h3>
              
              <div className="form-grid">
                {/* Superficie total */}
                <div className="form-group">
                  <label htmlFor="totalArea" className="form-label">Superficie total</label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="totalArea"
                      name="totalArea"
                      className={`form-control ${errors.totalArea ? 'is-invalid' : ''}`}
                      value={formData.totalArea}
                      onChange={handleChange}
                      placeholder="Superficie a cosechar"
                      disabled={submitting}
                    />
                    <select
                      name="areaUnit"
                      className="form-control"
                      value={formData.areaUnit}
                      onChange={handleChange}
                      disabled={submitting}
                      style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px', maxWidth: '100px' }}
                    >
                      <option value="ha">ha</option>
                      <option value="m²">m²</option>
                      <option value="acre">acre</option>
                    </select>
                  </div>
                  {errors.totalArea && <div className="invalid-feedback">{errors.totalArea}</div>}
                </div>
                
                {/* Rendimiento estimado */}
                <div className="form-group">
                  <label htmlFor="estimatedYield" className="form-label">Rendimiento estimado</label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="estimatedYield"
                      name="estimatedYield"
                      className={`form-control ${errors.estimatedYield ? 'is-invalid' : ''}`}
                      value={formData.estimatedYield}
                      onChange={handleChange}
                      placeholder="Rendimiento esperado"
                      disabled={submitting}
                    />
                    <select
                      name="yieldUnit"
                      className="form-control"
                      value={formData.yieldUnit}
                      onChange={handleChange}
                      disabled={submitting}
                      style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px', maxWidth: '120px' }}
                    >
                      <option value="kg/ha">kg/ha</option>
                      <option value="ton/ha">ton/ha</option>
                      <option value="qq/ha">qq/ha</option>
                    </select>
                  </div>
                  {errors.estimatedYield && <div className="invalid-feedback">{errors.estimatedYield}</div>}
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
                    disabled={submitting}
                    style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                  >
                    <option value="">Seleccionar método</option>
                    <option value="mechanical">Mecánica</option>
                    <option value="manual">Manual</option>
                    <option value="semi-mechanical">Semi-mecánica</option>
                  </select>
                </div>
                
                {/* Trabajadores */}
                <div className="form-group">
                  <label htmlFor="workers" className="form-label">Trabajadores</label>
                  <input
                    type="text"
                    id="workers"
                    name="workers"
                    className="form-control"
                    value={formData.workers}
                    onChange={handleChange}
                    placeholder="Número o nombres de trabajadores"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
            
            {/* Productos a utilizar */}
            <div className="form-section">
              <h3 className="section-title">Productos a utilizar en la cosecha</h3>
              
              {formData.fieldId ? (
                <>
                  <div className="products-section-header">
                    <p className="help-text">
                      Selecciona los productos que se utilizarán durante la cosecha (combustible, insumos, etc.)
                    </p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => setShowProductSelector(true)}
                      disabled={submitting}
                    >
                      <i className="fas fa-plus"></i> Agregar producto
                    </button>
                  </div>
                  
                  {formData.selectedProducts.length > 0 ? (
                    <div className="selected-products-list">
                      {formData.selectedProducts.map((sp) => (
                        <div key={sp.productId} className="selected-product-item">
                          <div className="product-info">
                            <span className="product-name">{sp.productName}</span>
                            <span className="product-stock">
                              Stock disponible: {sp.availableStock} {sp.unit}
                            </span>
                          </div>
                          <div className="product-quantity">
                            <input
                              type="number"
                              className="form-control"
                              value={sp.quantity}
                              onChange={(e) => handleProductQuantityChange(sp.productId, e.target.value)}
                              placeholder="Cantidad"
                              min="0"
                              max={sp.availableStock}
                              step="0.01"
                              disabled={submitting}
                            />
                            <span className="unit-label">{sp.unit}</span>
                            <button
                              type="button"
                              className="btn-icon btn-icon-sm btn-icon-danger"
                              onClick={() => handleRemoveProduct(sp.productId)}
                              disabled={submitting}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-products-message">
                      <p>No se han seleccionado productos para esta cosecha</p>
                    </div>
                  )}
                  
                  {errors.products && (
                    <div className="alert alert-error mt-2">
                      <i className="fas fa-exclamation-circle"></i> {errors.products}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-field-message">
                  <p>Selecciona un campo para ver los productos disponibles</p>
                </div>
              )}
            </div>
            
            {/* Información adicional */}
            <div className="form-section">
              <h3 className="section-title">Información adicional</h3>
              
              {/* Maquinaria */}
              <div className="form-group">
                <label htmlFor="machinery" className="form-label">Maquinaria</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="machineryInput"
                    className="form-control"
                    value={machineryInput}
                    onChange={(e) => setMachineryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMachinery();
                      }
                    }}
                    placeholder="Agregar maquinaria"
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
                
                {formData.machinery.length > 0 && (
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
                )}
              </div>
              
              {/* Almacén de destino */}
              <div className="form-group">
                <label htmlFor="targetWarehouse" className="form-label">Almacén de destino</label>
                <select
                  id="targetWarehouse"
                  name="targetWarehouse"
                  className="form-control"
                  value={formData.targetWarehouse}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                >
                  <option value="">Seleccionar almacén</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Parámetros de calidad */}
              <div className="form-group">
                <label htmlFor="qualityParameters" className="form-label">Parámetros de calidad</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="qualityInput"
                    className="form-control"
                    value={qualityInput}
                    onChange={(e) => setQualityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddQuality();
                      }
                    }}
                    placeholder="Agregar parámetro"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={handleAddQuality}
                    disabled={submitting}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                
                {formData.qualityParameters.length > 0 && (
                  <div className="tags-container">
                    {formData.qualityParameters.map((param, index) => (
                      <div key={index} className="tag">
                        {param}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemoveQuality(index)}
                          disabled={submitting}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Notas */}
              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notas</label>
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
              {isNew ? 'Planificando...' : 'Guardando...'}
            </>
          ) : (
            isNew ? 'Planificar cosecha' : 'Guardar cambios'
          )}
        </button>
      </div>
      
      {/* Modal selector de productos */}
      {showProductSelector && (
        <div className="product-selector-modal">
          <div className="product-selector-content">
            <div className="product-selector-header">
              <h3>Seleccionar producto</h3>
              <button
                type="button"
                className="dialog-close"
                onClick={() => setShowProductSelector(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="product-selector-body">
              {availableProducts.length > 0 ? (
                <div className="products-list">
                  {availableProducts.map((product) => {
                    const isSelected = formData.selectedProducts.some(sp => sp.productId === product.id);
                    return (
                      <div
                        key={product.id}
                        className={`product-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => !isSelected && handleAddProduct(product.id)}
                      >
                        <div className="product-details">
                          <span className="product-name">{product.name}</span>
                          <span className="product-info">
                            Stock: {product.stock} {product.unit}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="selected-badge">
                            <i className="fas fa-check"></i> Seleccionado
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-products">
                  <p>No hay productos disponibles en este campo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvestDialog;