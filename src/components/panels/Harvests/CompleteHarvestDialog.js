// src/components/panels/Harvests/CompleteHarvestDialog.js - Formulario para completar una cosecha
import React, { useState, useEffect } from 'react';

const CompleteHarvestDialog = ({ harvest, warehouses, onSave, onClose }) => {
  // Estado inicial para el formulario
  const [formData, setFormData] = useState({
    harvestDate: '',
    actualYield: '',
    totalHarvested: '',
    totalHarvestedUnit: 'kg',
    destination: '',
    qualityResults: [],
    harvestNotes: '',
    productsHarvested: []
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (harvest) {
      // Inicializar con la fecha actual
      const today = new Date().toISOString().split('T')[0];
      
      // Inicializar resultados de calidad si hay parámetros
      const initialQualityResults = harvest.qualityParameters 
        ? new Array(harvest.qualityParameters.length).fill('')
        : [];
      
      // Inicializar productos cosechados basándose en los productos seleccionados
      const initialProductsHarvested = harvest.selectedProducts 
        ? harvest.selectedProducts.map(sp => ({
            productId: sp.productId,
            productName: sp.productName,
            quantityUsed: sp.quantity,
            unit: sp.unit
          }))
        : [];
      
      setFormData({
        harvestDate: today,
        actualYield: harvest.estimatedYield || '',
        totalHarvested: '',
        totalHarvestedUnit: 'kg',
        destination: harvest.targetWarehouse || '',
        qualityResults: initialQualityResults,
        harvestNotes: '',
        productsHarvested: initialProductsHarvested
      });
    }
  }, [harvest]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limpiar errores al modificar el campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en resultados de calidad
  const handleQualityResultChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      qualityResults: prev.qualityResults.map((result, i) => 
        i === index ? value : result
      )
    }));
  };

  // Calcular la producción total estimada
  const calculateEstimatedTotal = () => {
    const area = harvest.totalArea || 0;
    const calculatedYield = formData.actualYield || harvest.estimatedYield || 0;
    const total = area * calculatedYield;
    
    return total > 0 ? total.toFixed(2) : '';
  };

  // Validar formulario antes de guardar
  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obligatorios
    if (!formData.harvestDate) {
      newErrors.harvestDate = 'La fecha de cosecha es obligatoria';
    }
    
    if (!formData.actualYield) {
      newErrors.actualYield = 'El rendimiento real es obligatorio';
    } else if (isNaN(Number(formData.actualYield))) {
      newErrors.actualYield = 'El rendimiento debe ser un número';
    }
    
    if (formData.totalHarvested && isNaN(Number(formData.totalHarvested))) {
      newErrors.totalHarvested = 'La producción total debe ser un número';
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
        actualYield: formData.actualYield ? Number(formData.actualYield) : 0,
        totalHarvested: formData.totalHarvested ? Number(formData.totalHarvested) : null,
        harvestDate: formData.harvestDate ? new Date(formData.harvestDate) : null
      };
      
      onSave(harvestData)
        .then(() => {
          onClose();
        })
        .catch(error => {
          console.error("Error al completar cosecha:", error);
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  return (
    <div className="dialog complete-harvest-dialog">
      <div className="dialog-header">
        <h2 className="dialog-title">
          Completar cosecha de {harvest.crop}
        </h2>
        <button className="dialog-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="dialog-body">
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Información de la cosecha */}
            <div className="form-section">
              <h3 className="section-title">Información de la cosecha</h3>
              
              <div className="harvest-info-summary">
                <div className="info-item">
                  <span className="info-label">Campo:</span>
                  <span className="info-value">{harvest.field?.name || 'Campo desconocido'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Superficie:</span>
                  <span className="info-value">{harvest.totalArea} {harvest.areaUnit || 'ha'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rendimiento estimado:</span>
                  <span className="info-value">{harvest.estimatedYield} {harvest.yieldUnit || 'kg/ha'}</span>
                </div>
              </div>
              
              <div className="form-grid">
                {/* Fecha de cosecha */}
                <div className="form-group">
                  <label htmlFor="harvestDate" className="form-label required">Fecha de cosecha</label>
                  <input
                    type="date"
                    id="harvestDate"
                    name="harvestDate"
                    className={`form-control ${errors.harvestDate ? 'is-invalid' : ''}`}
                    value={formData.harvestDate}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.harvestDate && <div className="invalid-feedback">{errors.harvestDate}</div>}
                </div>
                
                {/* Rendimiento real */}
                <div className="form-group">
                  <label htmlFor="actualYield" className="form-label required">Rendimiento real</label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="actualYield"
                      name="actualYield"
                      className={`form-control ${errors.actualYield ? 'is-invalid' : ''}`}
                      value={formData.actualYield}
                      onChange={handleChange}
                      placeholder="Rendimiento obtenido"
                      disabled={submitting}
                    />
                    <span className="input-group-text">{harvest.yieldUnit || 'kg/ha'}</span>
                  </div>
                  {errors.actualYield && <div className="invalid-feedback">{errors.actualYield}</div>}
                </div>
                
                {/* Producción total */}
                <div className="form-group">
                  <label htmlFor="totalHarvested" className="form-label">Producción total</label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="totalHarvested"
                      name="totalHarvested"
                      className={`form-control ${errors.totalHarvested ? 'is-invalid' : ''}`}
                      value={formData.totalHarvested}
                      onChange={handleChange}
                      placeholder={calculateEstimatedTotal() || 'Total cosechado'}
                      disabled={submitting}
                    />
                    <select
                      name="totalHarvestedUnit"
                      className="form-control"
                      value={formData.totalHarvestedUnit}
                      onChange={handleChange}
                      disabled={submitting}
                      style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px', maxWidth: '100px' }}
                    >
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="qq">qq</option>
                    </select>
                  </div>
                  {errors.totalHarvested && <div className="invalid-feedback">{errors.totalHarvested}</div>}
                  {calculateEstimatedTotal() && !formData.totalHarvested && (
                    <div className="form-text">
                      Estimado: {calculateEstimatedTotal()} kg (basado en superficie × rendimiento)
                    </div>
                  )}
                </div>
                
                {/* Destino */}
                <div className="form-group">
                  <label htmlFor="destination" className="form-label">Destino</label>
                  <select
                    id="destination"
                    name="destination"
                    className="form-control"
                    value={formData.destination}
                    onChange={handleChange}
                    disabled={submitting}
                    style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
                  >
                    <option value="">Seleccionar destino</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Productos utilizados */}
            {harvest.selectedProducts && harvest.selectedProducts.length > 0 && (
              <div className="form-section">
                <h3 className="section-title">Productos utilizados en la cosecha</h3>
                
                <div className="products-summary">
                  <p className="help-text">
                    Se descontarán los siguientes productos del inventario al completar la cosecha:
                  </p>
                  
                  <div className="products-list-summary">
                    {harvest.selectedProducts.map((product, index) => (
                      <div key={index} className="product-summary-item">
                        <div className="product-info">
                          <span className="product-name">{product.productName}</span>
                          <span className="product-quantity">
                            {product.quantity} {product.unit}
                          </span>
                        </div>
                        <div className="product-status">
                          <i className="fas fa-check-circle text-success"></i>
                          <span>Se descontará del stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Resultados de calidad */}
            {harvest.qualityParameters && harvest.qualityParameters.length > 0 && (
              <div className="form-section">
                <h3 className="section-title">Resultados de calidad</h3>
                
                <div className="quality-results-grid">
                  {harvest.qualityParameters.map((param, index) => (
                    <div key={index} className="form-group">
                      <label htmlFor={`quality-${index}`} className="form-label">
                        {param}
                      </label>
                      <input
                        type="text"
                        id={`quality-${index}`}
                        className="form-control"
                        value={formData.qualityResults[index] || ''}
                        onChange={(e) => handleQualityResultChange(index, e.target.value)}
                        placeholder="Resultado"
                        disabled={submitting}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Notas de cosecha */}
            <div className="form-section">
              <h3 className="section-title">Notas de cosecha</h3>
              
              <div className="form-group">
                <label htmlFor="harvestNotes" className="form-label">
                  Observaciones sobre la cosecha
                </label>
                <textarea
                  id="harvestNotes"
                  name="harvestNotes"
                  className="form-control"
                  value={formData.harvestNotes}
                  onChange={handleChange}
                  placeholder="Condiciones climáticas, problemas encontrados, observaciones generales..."
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
              Completando...
            </>
          ) : (
            <>
              <i className="fas fa-check"></i> Completar cosecha
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CompleteHarvestDialog;
