// src/pages/Harvests.js - Página principal de cosechas que conecta con el controlador
import React from 'react';
import HarvestsPanel from '../components/panels/Harvests/HarvestsPanel';
import useHarvestsController from '../controllers/HarvestsController';

const Harvests = () => {
  // Usar el controlador para obtener datos y funciones
  const {
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
    handleAddHarvest,
    handleAddHarvestFromField,
    handleEditHarvest,
    handleViewHarvest,
    handleCompleteHarvest,
    handleDeleteHarvest,
    handleSaveHarvest,
    handleCompleteHarvestSubmit,
    handleFilterChange,
    handleSearch,
    handleCloseDialog,
    refreshData
  } = useHarvestsController();

  // Renderizar el componente visual con los datos del controlador
  return (
    <HarvestsPanel
      harvests={harvests}
      fields={fields}
      products={products}
      warehouses={warehouses}
      loading={loading}
      error={error}
      selectedHarvest={selectedHarvest}
      selectedField={selectedField}
      selectedLots={selectedLots}
      dialogOpen={dialogOpen}
      dialogType={dialogType}
      filterOptions={filterOptions}
      onAddHarvest={handleAddHarvest}
      onEditHarvest={handleEditHarvest}
      onViewHarvest={handleViewHarvest}
      onCompleteHarvest={handleCompleteHarvest}
      onDeleteHarvest={handleDeleteHarvest}
      onSaveHarvest={handleSaveHarvest}
      onCompleteHarvestSubmit={handleCompleteHarvestSubmit}
      onFilterChange={handleFilterChange}
      onSearch={handleSearch}
      onCloseDialog={handleCloseDialog}
      onRefresh={refreshData}
    />
  );
};

export default Harvests;