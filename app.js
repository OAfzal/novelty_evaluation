// Static Evaluation System - Client-side Implementation
class StaticEvaluationSystem {
    constructor() {
        this.papers = null;
        this.currentAssignment = null;
        this.startTime = null;
        this.completedEvaluations = this.loadCompletedEvaluations();
        
        // Evaluation categories
        this.categories = {
            "reasoning_alignment": {
                "title": "Reasoning Alignment",
                "description": "Which candidate better aligns with the reference's reasoning approach and logic?"
            },
            "decision_alignment": {
                "title": "Decision Alignment", 
                "description": "Which candidate's conclusions/decisions are more consistent with the reference?"
            },
            "claim_substantiation": {
                "title": "Claim Substantiation",
                "description": "Which candidate better supports their claims with evidence similar to the reference?"
            },
            "novelty_assessment": {
                "title": "Novelty Assessment Quality",
                "description": "Which candidate's novelty evaluation is more aligned with the reference's assessment?"
            },
            "technical_depth": {
                "title": "Technical Depth",
                "description": "Which candidate matches the reference's level of technical analysis better?"
            },
            "critical_analysis": {
                "title": "Critical Analysis",
                "description": "Which candidate provides critical evaluation similar to the reference's approach?"
            }
        };

        // Response options
        this.responseOptions = {
            "candidate_a_much_better": "Candidate A Much Better",
            "candidate_a_better": "Candidate A Better",
            "similar_quality": "Similar Quality", 
            "candidate_b_better": "Candidate B Better",
            "candidate_b_much_better": "Candidate B Much Better"
        };

        this.init();
    }

    async init() {
        try {
            await this.loadPapers();
            this.updateStats();
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError('Failed to load evaluation data. Please refresh the page.');
        }
    }

    async loadPapers() {
        try {
            const response = await fetch('data/papers.json');
            if (!response.ok) {
                throw new Error('Failed to load papers data');
            }
            this.papers = await response.json();
            console.log(`Loaded ${Object.keys(this.papers).length} papers`);
        } catch (error) {
            console.error('Error loading papers:', error);
            throw error;
        }
    }

    loadCompletedEvaluations() {
        const saved = localStorage.getItem('completedEvaluations');
        return saved ? JSON.parse(saved) : [];
    }

    saveCompletedEvaluation(evaluation) {
        this.completedEvaluations.push(evaluation);
        localStorage.setItem('completedEvaluations', JSON.stringify(this.completedEvaluations));
    }

    generateEvaluationId() {
        return 'eval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getRandomAssignment(evaluatorId) {
        if (!this.papers || Object.keys(this.papers).length === 0) {
            throw new Error('No papers available');
        }

        const paperIds = Object.keys(this.papers);
        const paperId = paperIds[Math.floor(Math.random() * paperIds.length)];
        const paperSources = this.papers[paperId];
        
        // Reference is always a human review
        if (!paperSources.human || paperSources.human.length === 0) {
            // Try another paper
            return this.getRandomAssignment(evaluatorId);
        }
        
        const reference = paperSources.human[Math.floor(Math.random() * paperSources.human.length)];
        
        // Get all other candidates (excluding the chosen reference)
        const allCandidates = [];
        Object.values(paperSources).forEach(sourceList => {
            allCandidates.push(...sourceList);
        });
        const otherCandidates = allCandidates.filter(c => c.id !== reference.id);
        
        if (otherCandidates.length < 2) {
            // Try another paper
            return this.getRandomAssignment(evaluatorId);
        }
        
        // Randomly select two candidates to compare
        const shuffled = [...otherCandidates].sort(() => Math.random() - 0.5);
        const [candidateA, candidateB] = shuffled.slice(0, 2);
        
        // Randomly shuffle A/B assignment to avoid bias
        const [finalA, finalB] = Math.random() > 0.5 ? [candidateA, candidateB] : [candidateB, candidateA];

        return {
            paper_id: paperId,
            reference: reference,
            candidate_a: finalA,
            candidate_b: finalB,
            evaluation_id: this.generateEvaluationId(),
            evaluator_id: evaluatorId,
            timestamp: new Date().toISOString(),
            categories: this.categories
        };
    }

    updateStats() {
        const statsElement = document.getElementById('stats-content');
        const availablePapers = this.papers ? Object.keys(this.papers).length : 0;
        const completedCount = this.completedEvaluations.length;
        const evaluators = new Set(this.completedEvaluations.map(e => e.evaluator_id)).size;
        
        statsElement.innerHTML = `
            <strong>Statistics:</strong> 
            ${availablePapers} papers available | 
            ${completedCount} evaluations completed | 
            ${evaluators} evaluator(s)
        `;
    }
}

// Global state
let evaluationSystem = null;

// UI Functions
function showSection(sectionId) {
    const sections = ['setup-section', 'loading-section', 'evaluation-interface', 'error-section', 'success-section'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = id === sectionId ? 'block' : 'none';
        }
    });
}

function showError(message) {
    const errorElement = document.getElementById('error-section');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successElement = document.getElementById('success-section');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
}

function startEvaluation() {
    const evaluatorId = document.getElementById('evaluator-id').value.trim();
    if (!evaluatorId) {
        showError('Please enter an evaluator ID');
        return;
    }

    getAssignment(evaluatorId);
}

function getAssignment(evaluatorId) {
    showSection('loading-section');

    try {
        const assignment = evaluationSystem.getRandomAssignment(evaluatorId);
        evaluationSystem.currentAssignment = assignment;
        evaluationSystem.startTime = Date.now();
        displayAssignment();
        showSection('evaluation-interface');
    } catch (error) {
        showError('Failed to get assignment: ' + error.message);
        showSection('setup-section');
    }
}

function displayAssignment() {
    const assignment = evaluationSystem.currentAssignment;
    
    document.getElementById('paper-id').textContent = assignment.paper_id;
    document.getElementById('evaluation-id').textContent = assignment.evaluation_id;
    
    document.getElementById('reference-label').textContent = assignment.reference.label;
    document.getElementById('reference-content').textContent = assignment.reference.content;
    
    document.getElementById('candidate-a-label').textContent = assignment.candidate_a.label;
    document.getElementById('candidate-a-content').textContent = assignment.candidate_a.content;
    
    document.getElementById('candidate-b-label').textContent = assignment.candidate_b.label;
    document.getElementById('candidate-b-content').textContent = assignment.candidate_b.content;

    displayQuestions();
}

function displayQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    Object.entries(evaluationSystem.categories).forEach(([categoryId, category]) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-group';
        
        questionDiv.innerHTML = `
            <div class="question-title">${category.title}</div>
            <div class="question-description">${category.description}</div>
            <div class="radio-group" data-category="${categoryId}">
                ${Object.entries(evaluationSystem.responseOptions).map(([value, label]) => `
                    <label class="radio-option">
                        <input type="radio" name="${categoryId}" value="${value}">
                        <span>${label}</span>
                    </label>
                `).join('')}
            </div>
        `;
        
        container.appendChild(questionDiv);
    });

    // Add click handlers for radio options
    document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Update visual selection
            const group = this.parentElement;
            group.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function collectResponses() {
    const responses = {};
    Object.keys(evaluationSystem.categories).forEach(categoryId => {
        const selected = document.querySelector(`input[name="${categoryId}"]:checked`);
        if (selected) {
            responses[categoryId] = selected.value;
        }
    });
    return responses;
}

function validateResponses(responses) {
    const requiredCategories = Object.keys(evaluationSystem.categories);
    const answeredCategories = Object.keys(responses);
    
    const missing = requiredCategories.filter(cat => !answeredCategories.includes(cat));
    return missing;
}

function submitEvaluation() {
    const responses = collectResponses();
    const missing = validateResponses(responses);
    
    if (missing.length > 0) {
        showError(`Please answer all questions. Missing: ${missing.join(', ')}`);
        return;
    }

    const duration = evaluationSystem.startTime ? Math.floor((Date.now() - evaluationSystem.startTime) / 1000) : 0;
    const additionalComments = document.getElementById('additional-comments').value;

    document.getElementById('submit-btn').disabled = true;
    document.getElementById('submit-btn').textContent = 'Submitting...';

    try {
        // Build evaluation data
        const evaluationData = {
            paper_id: evaluationSystem.currentAssignment.paper_id,
            evaluation_id: evaluationSystem.currentAssignment.evaluation_id,
            evaluator_id: evaluationSystem.currentAssignment.evaluator_id,
            assignment_timestamp: evaluationSystem.currentAssignment.timestamp,
            submission_timestamp: new Date().toISOString(),
            reference: evaluationSystem.currentAssignment.reference,
            candidate_a: evaluationSystem.currentAssignment.candidate_a,
            candidate_b: evaluationSystem.currentAssignment.candidate_b,
            responses: responses,
            duration_seconds: duration,
            additional_comments: additionalComments
        };

        // Save to localStorage and provide download
        evaluationSystem.saveCompletedEvaluation(evaluationData);
        downloadEvaluation(evaluationData);
        
        showSuccess('Evaluation submitted successfully! Data has been saved locally and downloaded. You can get a new assignment or enter a new evaluator ID.');
        evaluationSystem.updateStats();
        
        document.getElementById('submit-btn').disabled = false;
        document.getElementById('submit-btn').textContent = 'Submit Evaluation';
        
    } catch (error) {
        showError('Failed to submit evaluation: ' + error.message);
        document.getElementById('submit-btn').disabled = false;
        document.getElementById('submit-btn').textContent = 'Submit Evaluation';
    }
}

function downloadEvaluation(evaluationData) {
    const dataStr = JSON.stringify(evaluationData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `evaluation_${evaluationData.evaluation_id}.json`;
    link.click();
}

function getNewAssignment() {
    const evaluatorId = document.getElementById('evaluator-id').value.trim();
    if (!evaluatorId) {
        showError('Please enter an evaluator ID');
        showSection('setup-section');
        return;
    }
    getAssignment(evaluatorId);
}

// Initialize the system when page loads
document.addEventListener('DOMContentLoaded', function() {
    evaluationSystem = new StaticEvaluationSystem();
    
    // Enable Enter key for evaluator ID input
    const evaluatorInput = document.getElementById('evaluator-id');
    if (evaluatorInput) {
        evaluatorInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                startEvaluation();
            }
        });
    }
});

// Export functions for global access
window.startEvaluation = startEvaluation;
window.getNewAssignment = getNewAssignment;
window.submitEvaluation = submitEvaluation;