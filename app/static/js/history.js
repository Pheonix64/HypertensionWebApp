document.addEventListener('DOMContentLoaded', function() {
    // Initialiser DataTables
    const historyTable = document.getElementById('historyTable');
    
    if (historyTable) {
        $(historyTable).DataTable({
            responsive: true,
            order: [[0, 'desc']], // Trier par date (première colonne) par défaut
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/fr-FR.json'
            },
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Tous"]],
            pageLength: 10,
            columnDefs: [
                { targets: [8, 9, 10], orderable: false } // Désactiver le tri pour les colonnes de prédiction et détails
            ]
        });
    }
    
    // Gestion des modales
    const modals = document.querySelectorAll('.modal');
    if (modals.length > 0) {
        modals.forEach(modal => {
            modal.addEventListener('shown.bs.modal', function() {
                // Créer un graphique de risque pour chaque modale au besoin
                // (Cette fonctionnalité peut être étendue si nécessaire)
            });
        });
    }
}); 