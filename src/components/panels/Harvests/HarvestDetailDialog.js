// src/components/panels/Harvests/HarvestDetailDialog.js - Vista detallada de una cosecha
import React from 'react';

const HarvestDetailDialog = ({ harvest, fields, products, warehouses, onClose, onEditHarvest, onCompleteHarvest, onDeleteHarvest }) => {
  // Función para formatear fecha
  const formatDate = (date) => {
    if (!date) return 'No definida';
    
    const d = date.seconds 
      ? new Date(date.seconds * 1000) 
      : new Date(date);
    
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    const statuses = {
      'pending': 'Pendiente',
      'scheduled': 'Programada',
      'in_progress': 'En proceso',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    
    return statuses[status] || status;
  };

  // Función para renderizar el estado como chip
  const renderStatusChip = (status) => {
    let statusClass = '';
    
    switch (status) {
      case 'pending': statusClass = 'status-pending'; break;
      case 'scheduled': statusClass = 'status-scheduled'; break;
      case 'in_progress': statusClass = 'status-in-progress'; break;
      case 'completed': statusClass = 'status-completed'; break;
      case 'cancelled': statusClass = 'status-cancelled'; break;
      default: statusClass = 'status-pending';
    }
    
    return <span className={`status-chip ${statusClass}`}>{getStatusText(status)}</span>;
  };

  // Obtener el nombre del campo
  const getFieldName = () => {
    if (harvest.field && harvest.field.name) {
      return harvest.field.name;
    }
    const field = fields.find(f => f.id === harvest.fieldId);
    return field ? field.name : 'Campo desconocido';
  };

  // Obtener el nombre del almacén
  const getWarehouseName = (warehouseId) => {
    if (!warehouseId) return 'No asignado';
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Almacén desconocido';
  };

  // Obtener productos seleccionados con información completa
  const getSelectedProductsDetails = () => {
    if (!harvest.selectedProducts || harvest.selectedProducts.length === 0) {
      return [];
    }

    return harvest.selectedProducts.map(sp => {
      const product = products.find(p => p.id === sp.productId);
      return {
        ...sp,
        productName: product ? product.name : 'Producto desconocido',
        productCode: product ? product.code : '',
        productCategory: product ? product.category : '',
        currentStock: product ? product.stock : 0
      };
    });
  };

  // Función para obtener el texto del método de cosecha
  const getHarvestMethodText = (method) => {
    const methods = {
      'mechanical': 'Mecánica',
      'manual': 'Manual',
      'semi-mechanical': 'Semi-mecánica'
    };
    
    return methods[method] || method || 'No especificado';
  };

  const selectedProductsDetails = getSelectedProductsDetails();

  return (
    <div className="dialog harvest-detail-dialog">
      <div className="dialog-header">
        <div className="dialog-title-container">
          <h2 className="dialog-title">Detalles de la cosecha</h2>
          {renderStatusChip(harvest.status)}
        </div>
        <button className="dialog-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="dialog-body">
        <div className="harvest-details-container">
          <div className="harvest-summary">
            <div className="harvest-summary-header">
              <div className="harvest-icon-large">
                <i className="fas fa-tractor"></i>
              </div>
              <div className="harvest-summary-content">
                <h3 className="harvest-name">{harvest.crop}</h3>
                <div className="harvest-field">{getFieldName()}</div>
                {harvest.lots && harvest.lots.length > 0 && (
                  <div className="harvest-lots">
                    Lotes: {harvest.lots.map(lot => lot.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="harvest-stats">
                <div className="stat">
                  <div className="stat-value">{harvest.totalArea} {harvest.areaUnit || 'ha'}</div>
                  <div className="stat-label">Superficie</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{harvest.estimatedYield} {harvest.yieldUnit || 'kg/ha'}</div>
                  <div className="stat-label">Rendimiento estimado</div>
                </div>
              </div>
            </div>
            
            {/* Acciones rápidas */}
            {harvest.status === 'pending' && (
              <div className="harvest-actions-bar">
                <button className="btn btn-primary" onClick={() => onCompleteHarvest(harvest)}>
                  <i className="fas fa-check"></i> Completar cosecha
                </button>
                <button className="btn btn-outline" onClick={() => onEditHarvest(harvest)}>
                  <i className="fas fa-edit"></i> Editar
                </button>
                <button className="btn btn-outline btn-danger" onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas eliminar esta cosecha?')) {
                    onDeleteHarvest(harvest.id);
                    onClose();
                  }
                }}>
                  <i className="fas fa-trash"></i> Eliminar
                </button>
              </div>
            )}

            {/* Información general */}
            <div className="detail-section">
              <h3 className="section-title">
                <i className="fas fa-info-circle"></i> Información general
              </h3>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Campo</span>
                  <span className="detail-value">{getFieldName()}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Cultivo</span>
                  <span className="detail-value">{harvest.crop}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Estado</span>
                  <span className="detail-value">{renderStatusChip(harvest.status)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Fecha planificada</span>
                  <span className="detail-value">{formatDate(harvest.plannedDate)}</span>
                </div>
                
                {harvest.harvestDate && (
                  <div className="detail-item">
                    <span className="detail-label">Fecha de cosecha</span>
                    <span className="detail-value">{formatDate(harvest.harvestDate)}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <span className="detail-label">Superficie total</span>
                  <span className="detail-value">{harvest.totalArea} {harvest.areaUnit || 'ha'}</span>
                </div>
              </div>
            </div>
            
            {/* Información de rendimiento */}
            <div className="detail-section">
              <h3 className="section-title">
                <i className="fas fa-chart-line"></i> Rendimiento
              </h3>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Rendimiento estimado</span>
                  <span className="detail-value">{harvest.estimatedYield} {harvest.yieldUnit || 'kg/ha'}</span>
                </div>
                
                {harvest.actualYield && (
                  <div className="detail-item">
                    <span className="detail-label">Rendimiento real</span>
                    <span className="detail-value">{harvest.actualYield} {harvest.yieldUnit || 'kg/ha'}</span>
                  </div>
                )}
                
                {harvest.totalHarvested && (
                  <div className="detail-item">
                    <span className="detail-label">Total cosechado</span>
                    <span className="detail-value">{harvest.totalHarvested} {harvest.totalHarvestedUnit || 'kg'}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <span className="detail-label">Método de cosecha</span>
                  <span className="detail-value">{getHarvestMethodText(harvest.harvestMethod)}</span>
                </div>
                
                {harvest.workers && (
                  <div className="detail-item">
                    <span className="detail-label">Trabajadores</span>
                    <span className="detail-value">{harvest.workers}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Productos utilizados */}
            {selectedProductsDetails.length > 0 && (
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-boxes"></i> Productos utilizados
                </h3>
                
                <div className="products-table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                        <th>Stock actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProductsDetails.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <div className="product-info">
                              <span className="product-name">{product.productName}</span>
                              {product.productCode && (
                                <span className="product-code">{product.productCode}</span>
                              )}
                            </div>
                          </td>
                          <td>{product.productCategory}</td>
                          <td>{product.quantity} {product.unit}</td>
                          <td>
                            <span className={`stock-value ${product.currentStock < product.quantity ? 'stock-low' : ''}`}>
                              {product.currentStock} {product.unit}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Maquinaria */}
            {harvest.machinery && harvest.machinery.length > 0 && (
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-cog"></i> Maquinaria utilizada
                </h3>
                
                <div className="tags-display">
                  {harvest.machinery.map((item, index) => (
                    <span key={index} className="tag-display">{item}</span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Información adicional */}
            <div className="detail-section">
              <h3 className="section-title">
                <i className="fas fa-info"></i> Información adicional
              </h3>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Almacén de destino</span>
                  <span className="detail-value">{getWarehouseName(harvest.targetWarehouse)}</span>
                </div>
                
                {harvest.destination && (
                  <div className="detail-item">
                    <span className="detail-label">Destino final</span>
                    <span className="detail-value">{harvest.destination}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Parámetros de calidad */}
            {harvest.qualityParameters && harvest.qualityParameters.length > 0 && (
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-check-circle"></i> Parámetros de calidad
                </h3>
                
                <div className="quality-params-list">
                  {harvest.qualityParameters.map((param, index) => (
                    <div key={index} className="quality-param">
                      <span className="param-name">{param}</span>
                      {harvest.qualityResults && harvest.qualityResults[index] && (
                        <span className="param-result">{harvest.qualityResults[index]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Notas */}
            {(harvest.notes || harvest.harvestNotes) && (
              <div className="detail-section">
                <h3 className="section-title">
                  <i className="fas fa-sticky-note"></i> Notas
                </h3>
                
                {harvest.notes && (
                  <div className="notes-content">
                    <h4>Notas de planificación:</h4>
                    <p>{harvest.notes}</p>
                  </div>
                )}
                
                {harvest.harvestNotes && (
                  <div className="notes-content">
                    <h4>Notas de cosecha:</h4>
                    <p>{harvest.harvestNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="dialog-footer">
        <button className="btn btn-outline" onClick={onClose}>
          Cerrar
        </button>
        {harvest.status === 'pending' && (
          <>
            <button className="btn btn-outline" onClick={() => onEditHarvest(harvest)}>
              <i className="fas fa-edit"></i> Editar
            </button>
            <button className="btn btn-primary" onClick={() => onCompleteHarvest(harvest)}>
              <i className="fas fa-check"></i> Completar cosecha
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default HarvestDetailDialog;