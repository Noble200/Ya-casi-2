// src/components/panels/Harvests/ProductSelectionPanel.js - Componente para seleccionar productos para cosecha
import React, { useState, useEffect } from 'react';

const ProductSelectionPanel = ({ 
  products, 
  fields, 
  warehouses, 
  selectedProducts, 
  onProductsChange,
  disabled = false 
}) => {
  const [productFilters, setProductFilters] = useState({
    fieldId: '',
    warehouseId: '',
    lotId: '',
    category: 'all',
    searchTerm: ''
  });
  
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableWarehouses, setAvailableWarehouses] = useState([]);
  const [availableLots, setAvailableLots] = useState([]);

  // Filtrar productos disponibles basado en los filtros
  useEffect(() => {
    let filtered = products || [];

    // Filtrar productos que son cosechables (semillas, cultivos, etc.)
    filtered = filtered.filter(product => 
      ['semilla', 'fertilizante', 'insumo', 'otro'].includes(product.category) &&
      product.stock > 0 // Solo productos con stock disponible
    );

    // Filtro por campo
    if (productFilters.fieldId) {
      filtered = filtered.filter(product => product.fieldId === productFilters.fieldId);
    }

    // Filtro por almacén
    if (productFilters.warehouseId) {
      filtered = filtered.filter(product => product.warehouseId === productFilters.warehouseId);
    }

    // Filtro por lote
    if (productFilters.lotId) {
      filtered = filtered.filter(product => product.lotId === productFilters.lotId);
    }

    // Filtro por categoría
    if (productFilters.category !== 'all') {
      filtered = filtered.filter(product => product.category === productFilters.category);
    }

    // Filtro por búsqueda
    if (productFilters.searchTerm) {
      const term = productFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.code && product.code.toLowerCase().includes(term)) ||
        (product.lotNumber && product.lotNumber.toLowerCase().includes(term))
      );
    }

    setAvailableProducts(filtered);
  }, [products, productFilters]);

  // Actualizar almacenes y lotes disponibles cuando cambia el campo
  useEffect(() => {
    if (productFilters.fieldId && fields) {
      const field = fields.find(f => f.id === productFilters.fieldId);
      
      // Filtrar almacenes del campo seleccionado
      const fieldWarehouses = warehouses?.filter(w => w.fieldId === productFilters.fieldId) || [];
      setAvailableWarehouses(fieldWarehouses);
      
      // Obtener lotes del campo
      if (field && field.lots) {
        setAvailableLots(field.lots);
      } else {
        setAvailableLots([]);
      }
    } else {
      setAvailableWarehouses([]);
      setAvailableLots([]);
    }
  }, [productFilters.fieldId, fields, warehouses]);

  // Manejar cambio en filtros
  const handleFilterChange = (filterName, value) => {
    setProductFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      
      // Limpiar filtros dependientes
      if (filterName === 'fieldId') {
        newFilters.warehouseId = '';
        newFilters.lotId = '';
      }
      
      return newFilters;
    });
  };

  // Manejar selección/deselección de producto
  const handleProductToggle = (product) => {
    const isSelected = selectedProducts.some(p => p.productId === product.id);
    
    if (isSelected) {
      // Remover producto
      const updated = selectedProducts.filter(p => p.productId !== product.id);
      onProductsChange(updated);
    } else {
      // Añadir producto con información completa
      const field = fields?.find(f => f.id === product.fieldId);
      const warehouse = warehouses?.find(w => w.id === product.warehouseId);
      const lot = field?.lots?.find(l => l.id === product.lotId);
      
      const newProduct = {
        productId: product.id,
        name: product.name,
        code: product.code,
        unit: product.unit,
        availableStock: product.stock,
        harvestQuantity: Math.min(product.stock, 1), // Cantidad inicial
        storageType: product.storageType,
        category: product.category,
        fieldId: product.fieldId,
        fieldName: field?.name || 'Campo desconocido',
        warehouseId: product.warehouseId,
        warehouseName: warehouse?.name,
        lotId: product.lotId,
        lotName: lot?.name
      };
      
      const updated = [...selectedProducts, newProduct];
      onProductsChange(updated);
    }
  };

  // Manejar cambio en cantidad de cosecha
  const handleQuantityChange = (productId, quantity) => {
    const updated = selectedProducts.map(p => {
      if (p.productId === productId) {
        const newQuantity = Math.min(Math.max(0, Number(quantity)), p.availableStock);
        return { ...p, harvestQuantity: newQuantity };
      }
      return p;
    });
    onProductsChange(updated);
  };

  // Remover producto seleccionado
  const handleRemoveProduct = (productId) => {
    const updated = selectedProducts.filter(p => p.productId !== productId);
    onProductsChange(updated);
  };

  // Obtener información del stock
  const getStockStatus = (stock, minStock = 0) => {
    if (stock === 0) return 'empty';
    if (stock <= minStock) return 'low';
    return 'available';
  };

  return (
    <div className="product-selection-section">
      <h3 className="section-title">
        <i className="fas fa-boxes"></i> Selección de productos para cosechar
      </h3>
      
      {/* Filtros de productos */}
      <div className="product-filters">
        <div className="filter-item">
          <label htmlFor="productFieldFilter">Campo:</label>
          <select
            id="productFieldFilter"
            className="form-control"
            value={productFilters.fieldId}
            onChange={(e) => handleFilterChange('fieldId', e.target.value)}
            disabled={disabled}
            style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
          >
            <option value="">Todos los campos</option>
            {fields?.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
        
        {productFilters.fieldId && (
          <>
            <div className="filter-item">
              <label htmlFor="productWarehouseFilter">Almacén:</label>
              <select
                id="productWarehouseFilter"
                className="form-control"
                value={productFilters.warehouseId}
                onChange={(e) => handleFilterChange('warehouseId', e.target.value)}
                disabled={disabled}
                style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
              >
                <option value="">Todos los almacenes</option>
                {availableWarehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label htmlFor="productLotFilter">Lote:</label>
              <select
                id="productLotFilter"
                className="form-control"
                value={productFilters.lotId}
                onChange={(e) => handleFilterChange('lotId', e.target.value)}
                disabled={disabled}
                style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
              >
                <option value="">Todos los lotes</option>
                {availableLots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        
        <div className="filter-item">
          <label htmlFor="productCategoryFilter">Categoría:</label>
          <select
            id="productCategoryFilter"
            className="form-control"
            value={productFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            disabled={disabled}
            style={{ height: 'auto', minHeight: '40px', paddingTop: '8px', paddingBottom: '8px' }}
          >
            <option value="all">Todas las categorías</option>
            <option value="semilla">Semilla</option>
            <option value="fertilizante">Fertilizante</option>
            <option value="insumo">Insumo</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        
        <div className="filter-item">
          <label htmlFor="productSearch">Buscar:</label>
          <input
            type="text"
            id="productSearch"
            className="form-control"
            placeholder="Buscar productos..."
            value={productFilters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Lista de productos disponibles */}
      {availableProducts.length > 0 ? (
        <div className="available-products-grid">
          {availableProducts.map((product) => {
            const isSelected = selectedProducts.some(p => p.productId === product.id);
            const stockStatus = getStockStatus(product.stock, product.minStock);
            
            return (
              <div 
                key={product.id} 
                className={`product-item ${isSelected ? 'selected' : ''}`}
                onClick={() => !disabled && handleProductToggle(product)}
              >
                <div className="product-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={disabled}
                  />
                </div>
                <div className="product-info">
                  <div className="product-item-name">{product.name}</div>
                  <div className="product-item-details">
                    <span>
                      <i className="fas fa-layer-group"></i>
                      {product.category}
                    </span>
                    <span className="product-stock-info">
                      <i className="fas fa-boxes"></i>
                      <span className={`stock-${stockStatus}`}>
                        {product.stock} {product.unit}
                      </span>
                    </span>
                    <span>
                      <i className="fas fa-archive"></i>
                      {product.storageType === 'bolsas' && 'Bolsas'}
                      {product.storageType === 'suelto' && 'Suelto'}
                      {product.storageType === 'unidad' && 'Unidades'}
                      {product.storageType === 'sacos' && 'Sacos'}
                      {product.storageType === 'tambores' && 'Tambores'}
                      {product.storageType === 'contenedores' && 'Contenedores'}
                      {product.storageType === 'cajas' && 'Cajas'}
                      {!product.storageType && 'No especificado'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-table-message">
          No se encontraron productos disponibles para cosechar con los filtros seleccionados.
        </div>
      )}

      {/* Productos seleccionados */}
      {selectedProducts.length > 0 && (
        <div className="selected-products-summary">
          <h4 className="selected-products-title">
            Productos seleccionados ({selectedProducts.length})
          </h4>
          
          <div className="selected-products-list">
            {selectedProducts.map((product) => (
              <div key={product.productId} className="selected-product-item">
                <div className="selected-product-info">
                  <div className="selected-product-name">{product.name}</div>
                  <div className="selected-product-details">
                    Stock disponible: {product.availableStock} {product.unit} | {product.storageType}
                    {product.warehouseName && ` | ${product.warehouseName}`}
                    {product.lotName && ` | Lote: ${product.lotName}`}
                  </div>
                </div>
                
                <div className="quantity-input">
                  <label>Cantidad a cosechar:</label>
                  <input
                    type="number"
                    min="0"
                    max={product.availableStock}
                    step="0.01"
                    value={product.harvestQuantity}
                    onChange={(e) => handleQuantityChange(product.productId, e.target.value)}
                    disabled={disabled}
                    className="form-control"
                  />
                  <span>{product.unit}</span>
                </div>
                
                <button
                  type="button"
                  className="btn-icon btn-icon-sm btn-icon-danger remove-product-btn"
                  onClick={() => handleRemoveProduct(product.productId)}
                  disabled={disabled}
                  title="Remover producto"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelectionPanel;