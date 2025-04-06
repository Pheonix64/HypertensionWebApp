document.addEventListener('DOMContentLoaded', function() {
    // Initialiser la validation du formulaire
    const form = document.getElementById('predictionForm');
    const resultCard = document.getElementById('resultCard');
    const submitBtn = document.getElementById('submitBtn');
    const spinnerLoading = document.getElementById('spinnerLoading');
    let factorsChart = null;

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Validation du formulaire
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        // Désactiver le bouton et afficher le spinner
        submitBtn.disabled = true;
        spinnerLoading.classList.remove('d-none');
        
        // Récupérer toutes les données du formulaire
        const formData = new FormData(form);
        
        try {
            // Envoyer les données à l'API
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Afficher les résultats
            displayResults(result);
            
        } catch (error) {
            console.error('Erreur lors de la prédiction:', error);
            alert('Une erreur est survenue lors de la prédiction. Veuillez réessayer.');
        } finally {
            // Réactiver le bouton et masquer le spinner
            submitBtn.disabled = false;
            spinnerLoading.classList.add('d-none');
        }
    });

    // Fonction pour afficher les résultats
    function displayResults(result) {
        const predictionText = document.getElementById('predictionText');
        const probabilityText = document.getElementById('probabilityText');
        const riskBar = document.getElementById('riskBar');
        const resultTitle = document.getElementById('resultTitle');
        
        // Définir le texte de prédiction
        predictionText.textContent = result.risk_level;
        
        // Calculer le pourcentage de probabilité
        const probabilityPercentage = (result.probability * 100).toFixed(1);
        
        // Mettre à jour le texte de probabilité
        probabilityText.textContent = `Probabilité: ${probabilityPercentage}%`;
        
        // Mettre à jour la barre de risque
        riskBar.style.width = `${probabilityPercentage}%`;
        riskBar.setAttribute('aria-valuenow', probabilityPercentage);
        
        // Configurer les couleurs en fonction du niveau de risque
        if (result.prediction === 1) {
            resultCard.classList.add('high-risk');
            resultCard.classList.remove('low-risk');
            resultTitle.textContent = 'Résultat: Risque Cardiaque Élevé';
            resultCard.querySelector('.card-header').classList.add('bg-danger');
            resultCard.querySelector('.card-header').classList.remove('bg-success');
            riskBar.classList.add('bg-danger');
            riskBar.classList.remove('bg-success');
        } else {
            resultCard.classList.add('low-risk');
            resultCard.classList.remove('high-risk');
            resultTitle.textContent = 'Résultat: Risque Cardiaque Faible';
            resultCard.querySelector('.card-header').classList.add('bg-success');
            resultCard.querySelector('.card-header').classList.remove('bg-danger');
            riskBar.classList.add('bg-success');
            riskBar.classList.remove('bg-danger');
        }
        
        // Créer un graphique pour visualiser les facteurs
        createFactorsChart();
        
        // Afficher la carte de résultat
        resultCard.classList.remove('d-none');
        resultCard.classList.add('fade-in');
        
        // Faire défiler jusqu'au résultat
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Fonction pour créer un graphique des facteurs
    function createFactorsChart() {
        const ctx = document.getElementById('factorsChart').getContext('2d');
        
        // Récupérer les valeurs du formulaire
        const formData = new FormData(form);
        const factors = [
            { name: 'Âge', value: parseFloat(formData.get('age')), max: 120, color: 'rgba(255, 99, 132, 0.7)' },
            { name: 'Cigarettes/jour', value: parseFloat(formData.get('cigsPerDay')), max: 100, color: 'rgba(54, 162, 235, 0.7)' },
            { name: 'Cholestérol', value: parseFloat(formData.get('totChol')), max: 600, color: 'rgba(255, 206, 86, 0.7)' },
            { name: 'Pression Sys.', value: parseFloat(formData.get('sysBP')), max: 250, color: 'rgba(75, 192, 192, 0.7)' },
            { name: 'Pression Dia.', value: parseFloat(formData.get('diaBP')), max: 150, color: 'rgba(153, 102, 255, 0.7)' },
            { name: 'IMC', value: parseFloat(formData.get('BMI')), max: 50, color: 'rgba(255, 159, 64, 0.7)' },
            { name: 'Fréquence Card.', value: parseFloat(formData.get('heartRate')), max: 200, color: 'rgba(199, 199, 199, 0.7)' },
            { name: 'Glucose', value: parseFloat(formData.get('glucose')), max: 400, color: 'rgba(83, 102, 255, 0.7)' }
        ];
        
        // Convertir en pourcentage relatif à la valeur maximale
        const labels = factors.map(f => f.name);
        const data = factors.map(f => (f.value / f.max) * 100);
        const backgroundColor = factors.map(f => f.color);
        
        // Détruire le graphique existant s'il existe
        if (factorsChart) {
            factorsChart.destroy();
        }
        
        // Créer le nouveau graphique
        factorsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Niveau relatif',
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: backgroundColor.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Niveau relatif (%)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const index = context.dataIndex;
                                return `${factors[index].name}: ${factors[index].value} (${context.formattedValue}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Réinitialiser le formulaire au chargement
    form.reset();
    form.classList.remove('was-validated');
}); 