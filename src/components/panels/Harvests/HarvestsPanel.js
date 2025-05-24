// src/components/panels/Harvests/HarvestsPanel.js - Panel principal para gestión de cosechas
import React from 'react';
import './harvests.css';
import HarvestDialog from './HarvestDialog';
import HarvestDetailDialog from './HarvestDetailDialog';
import CompleteHarvestDialog from './CompleteHarvestDialog';

const HarvestsPanel = ({
  harvests,
  fields,
  products,
  warehouses,
  loading,
  error,
  selectedHarvest,
  selectedField,
  selectedLots,
  dialogOpen,
  dialogType,
  filterOptions,
  onAddHarvest,
  onEditHarvest,
  onViewHarvest,
  onCompleteHarvest,
  onDeleteHarvest,
  onSaveHarvest,
  onCompleteHarvestSubmit,
  onFilterChange,
  onSearch,
  onCloseDialog,
  onRefresh
}) => {
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

  // Función para obtener el color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'scheduled':
        return 'status-scheduled';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'scheduled':
        return 'Programada';
      case 'in_progress':
        return 'En proceso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  // Función para renderizar el estado como chip
  const renderStatusChip = (status) => {
    return (
      <span className={`status-chip ${getStatusColor(status)}`}>
        {getStatusText(status)}
      </span>
    );
  };

  // Función para obtener el nombre del campo
  const getFieldName = (harvest) => {
    if (harvest.field && harvest.field.name) {
      return harvest.field.name;
    }
    const field = fields.find(f => f.id === harvest.fieldId);
    return field ? field.name : 'Campo desconocido';
  };

  // Función para obtener los nombres de los lotes
  const getLotNames = (harvest) => {
    if (!harvest.lots || harvest.lots.length === 0) {
      return 'Todos los lotes';
    }
    return harvest.lots.map(lot => lot.name).join(', ');
  };

  // Función para calcular el progreso de la cosecha
  const getHarvestProgress = (harvest) => {
    if (harvest.status === 'completed') return 100;
    if (harvest.status === 'cancelled') return 0;
    if (harvest.status === 'in_progress') return 50;
    return 0;
  };

  // Función para obtener el icono según el estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'fas fa-clock';
      case 'scheduled':
        return 'fas fa-calendar-check';
      case 'in_progress':
        return 'fas fa-spinner';
      case 'completed':
        return 'fas fa-check-circle';
      case 'cancelled':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-circle';
    }
  };

  // Función para obtener productos seleccionados de una cosecha
  const getSelectedProducts = (harvest) => {
    if (!harvest.selectedProducts || harvest.selectedProducts.length === 0) {
      return [];
    }

    return harvest.selectedProducts.map(sp => {
      const product = products.find(p => p.id === sp.productId);
      return {
        ...sp,
        productName: product ? product.name : 'Producto desconocido',
        productUnit: product ? product.unit : 'unidad'
      };
    });
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando cosechas...</p>
      </div>
    );
  }

  return (
    <div className="harvests-container">
      {/* Encabezado */}
      <div className="harvests-header">
        <h1 className="harvests-title">Gestión de Cosechas</h1>
        <div className="harvests-actions">
          <button
            className="btn btn-primary"
            onClick={onAddHarvest}
          >
            <i className="fas fa-plus"></i> Nueva Cosecha
          </button>
          <button
            className="btn btn-icon"
            onClick={onRefresh}
            title="Actualizar datos"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <div className="filters-group">
          <div className="filter-item">
            <label htmlFor="statusFilter">Estado:</label>
            <select
              id="statusFilter"
              className="form-control"
              onChange={(e) => onFilterChange('status', e.target.value)}
              style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
            >
              {filterOptions.status.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label htmlFor="cropFilter">Cultivo:</label>
            <select
              id="cropFilter"
              className="form-control"
              onChange={(e) => onFilterChange('crop', e.target.value)}
              style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
            >
              {filterOptions.crops.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label htmlFor="fieldFilter">Campo:</label>
            <select
              id="fieldFilter"
              className="form-control"
              onChange={(e) => onFilterChange('field', e.target.value)}
              style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
            >
              <option value="all">Todos los campos</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label htmlFor="dateRangeFilter">Fecha:</label>
            <div className="date-range-filter">
              <input
                type="date"
                id="startDate"
                className="form-control"
                onChange={(e) => onFilterChange('dateRange', { 
                  ...filterOptions.dateRange, 
                  start: e.target.value 
                })}
              />
              <span className="date-separator">-</span>
              <input
                type="date"
                id="endDate"
                className="form-control"
                onChange={(e) => onFilterChange('dateRange', { 
                  ...filterOptions.dateRange, 
                  end: e.target.value 
                })}
              />
            </div>
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-input">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar cosechas..."
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
          <button className="btn btn-sm" onClick={onRefresh}>
            <i className="fas fa-sync-alt"></i> Reintentar
          </button>
        </div>
      )}

      {/* Grid de cosechas */}
      {harvests.length > 0 ? (
        <div className="harvests-grid">
          {harvests.map((harvest) => {
            const selectedProducts = getSelectedProducts(harvest);
            const progress = getHarvestProgress(harvest);
            
            return (
              <div key={harvest.id} className="harvest-card">
                <div className="harvest-header">
                  <div className="harvest-title-container">
                    <h3 className="harvest-title">{harvest.crop}</h3>
                    {renderStatusChip(harvest.status)}
                  </div>
                  <div className="harvest-icon">
                    <i className={getStatusIcon(harvest.status)}></i>
                  </div>
                </div>
                
                <div className="harvest-content">
                  <div className="harvest-details">
                    <div className="harvest-detail">
                      <span className="detail-label">Campo</span>
                      <span className="detail-value">{getFieldName(harvest)}</span>
                    </div>
                    
                    <div className="harvest-detail">
                      <span className="detail-label">Lotes</span>
                      <span className="detail-value">{getLotNames(harvest)}</span>
                    </div>
                    
                    <div className="harvest-detail">
                      <span className="detail-label">Superficie</span>
                      <span className="detail-value">
                        {harvest.totalArea} {harvest.areaUnit || 'ha'}
                      </span>
                    </div>
                    
                    <div className="harvest-detail">
                      <span className="detail-label">Fecha planificada</span>
                      <span className="detail-value">{formatDate(harvest.plannedDate)}</span>
                    </div>
                    
                    {harvest.harvestDate && (
                      <div className="harvest-detail">
                        <span className="detail-label">Fecha de cosecha</span>
                        <span className="detail-value">{formatDate(harvest.harvestDate)}</span>
                      </div>
                    )}
                    
                    <div className="harvest-detail">
                      <span className="detail-label">Rendimiento estimado</span>
                      <span className="detail-value">
                        {harvest.estimatedYield} {harvest.yieldUnit || 'kg/ha'}
                      </span>
                    </div>
                    
                    {harvest.actualYield && (
                      <div className="harvest-detail">
                        <span className="detail-label">Rendimiento real</span>
                        <span className="detail-value">
                          {harvest.actualYield} {harvest.yieldUnit || 'kg/ha'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Productos seleccionados */}
                  {selectedProducts.length > 0 && (
                    <div className="harvest-products">
                      <h4 className="products-title">
                        <i className="fas fa-boxes"></i> Productos a usar
                      </h4>
                      <div className="products-list">
                        {selectedProducts.map((sp, index) => (
                          <div key={index} className="product-item">
                            <span className="product-name">{sp.productName}</span>
                            <span className="product-quantity">
                              {sp.quantity} {sp.productUnit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progreso */}
                  {harvest.status === 'in_progress' && (
                    <div className="harvest-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{progress}% completado</span>
                    </div>
                  )}
                  
                  <div className="harvest-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => onViewHarvest(harvest)}
                      title="Ver detalles"
                    >
                      <i className="fas fa-eye"></i> Detalles
                    </button>
                    
                    {harvest.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => onCompleteHarvest(harvest)}
                          title="Completar cosecha"
                        >
                          <i className="fas fa-check"></i> Completar
                        </button>
                        
                        <button
                          className="btn-icon btn-icon-sm"
                          onClick={() => onEditHarvest(harvest)}
                          title="Editar cosecha"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </>
                    )}
                    
                    {harvest.status === 'pending' && (
                      <button
                        className="btn-icon btn-icon-sm btn-icon-danger"
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de que deseas eliminar esta cosecha?')) {
                            onDeleteHarvest(harvest.id);
                          }
                        }}
                        title="Eliminar cosecha"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-tractor"></i>
          </div>
          <h2 className="empty-title">No hay cosechas registradas</h2>
          <p className="empty-description">
            Comienza planificando una nueva cosecha para gestionar tus cultivos.
          </p>
          <button className="btn btn-primary" onClick={onAddHarvest}>
            <i className="fas fa-plus"></i> Añadir cosecha
          </button>
        </div>
      )}

      {/* Diálogos */}
      {dialogOpen && (
        <div className="dialog-overlay">
          {dialogType === 'add-harvest' || dialogType === 'edit-harvest' ? (
            <HarvestDialog
              harvest={selectedHarvest}
              fields={fields}
              products={products}
              warehouses={warehouses}
              preselectedField={selectedField}
              preselectedLots={selectedLots}
              isNew={dialogType === 'add-harvest'}
              onSave={onSaveHarvest}
              onClose={onCloseDialog}
            />
          ) : dialogType === 'view-harvest' ? (
            <HarvestDetailDialog
              harvest={selectedHarvest}
              fields={fields}
              products={products}
              warehouses={warehouses}
              onClose={onCloseDialog}
              onEditHarvest={onEditHarvest}
              onCompleteHarvest={onCompleteHarvest}
              onDeleteHarvest={onDeleteHarvest}
            />
          ) : dialogType === 'complete-harvest' ? (
            <CompleteHarvestDialog
              harvest={selectedHarvest}
              warehouses={warehouses}
              onSave={onCompleteHarvestSubmit}
              onClose={onCloseDialog}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default HarvestsPanel;