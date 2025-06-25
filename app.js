// Hybrid Static Evaluation System - Client-side Implementation
class HybridEvaluationSystem {
    constructor() {
        this.evaluatorId = null;
        this.evaluatorSamples = null;
        this.currentSampleIndex = 0;
        this.currentSample = null;
        this.startTime = null;
        this.completedEvaluations = this.loadCompletedEvaluations();
        this.assignmentConfig = null;
        this.isAuthenticated = false;
        
        // Authentication settings (loaded from config)
        this.validAccessCodes = [];
        
        // Updated evaluation categories from reference_comparison.py
        this.categories = {
            "novelty_reasoning_alignment": {
                "title": "Novelty Reasoning Alignment",
                "description": "Which assessment better captures the key novelty arguments and reasoning presented in the reference review?"
            },
            "novelty_decision_alignment": {
                "title": "Novelty Decision Alignment", 
                "description": "Which assessment reaches a novelty conclusion that is more consistent with the reference review's novelty decision?"
            },
            "claim_substantiation": {
                "title": "Claim Substantiation",
                "description": "Which candidate better supports their claims with evidence? Consider which one: (1) Provides specific examples or citations to back up statements, (2) References concrete details from the paper being reviewed, (3) Uses evidence that directly supports their novelty arguments, (4) Avoids unsupported generalizations or assertions"
            },
            "analytical_quality": {
                "title": "Analytical Quality",
                "description": "Which assessment provides a more thorough and insightful technical analysis? Consider which one: (1) Explains technical methods and contributions in more detail, (2) Identifies specific strengths and limitations of the approach, (3) Demonstrates deeper understanding of the technical content, (4) Provides more substantive evaluation beyond surface-level comments"
            }
        };

        // Updated response options from reference_comparison.py
        this.responseOptions = {
            "a_wins": "A wins",
            "b_wins": "B wins", 
            "tie": "Tie",
            "unclear": "Unclear"
        };

        this.init();
    }

    async init() {
        try {
            await this.loadAuthConfig();
            await this.loadAssignmentConfig();
            this.updateStats();
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError('Failed to load evaluation configuration. Please check that the assignment files are available.');
        }
    }

    async loadAuthConfig() {
        try {
            const response = await fetch('data/auth_config.json');
            if (response.ok) {
                const authConfig = await response.json();
                this.validAccessCodes = authConfig.access_codes || [];
                console.log('Loaded authentication configuration');
            } else {
                // Fallback to hardcoded codes
                this.validAccessCodes = ["NOVELTY2025", "EVAL2025", "ICLR2025"];
                console.warn('Using fallback access codes');
            }
        } catch (error) {
            // Fallback to hardcoded codes
            this.validAccessCodes = ["NOVELTY2025", "EVAL2025", "ICLR2025"];
            console.warn('Failed to load auth config, using fallback codes');
        }
    }

    authenticate(accessCode) {
        // Check if access code is valid
        const isValid = this.validAccessCodes.includes(accessCode.toUpperCase());
        
        if (isValid) {
            this.isAuthenticated = true;
            // Store authentication in session storage (cleared when browser closes)
            sessionStorage.setItem('evalauth', btoa(accessCode));
            return true;
        }
        return false;
    }

    checkExistingAuth() {
        // Check if user is already authenticated in this session
        const storedAuth = sessionStorage.getItem('evalauth');
        if (storedAuth) {
            try {
                const accessCode = atob(storedAuth);
                return this.authenticate(accessCode);
            } catch (e) {
                sessionStorage.removeItem('evalauth');
                return false;
            }
        }
        return false;
    }

    async loadAssignmentConfig() {
        try {
            const response = await fetch('data/static_evaluation_config.json');
            if (!response.ok) {
                throw new Error('Failed to load assignment configuration');
            }
            this.assignmentConfig = await response.json();
            console.log('Loaded assignment configuration:', this.assignmentConfig);
        } catch (error) {
            console.error('Error loading assignment config:', error);
            // Continue without config - fallback to single evaluator mode
            this.assignmentConfig = null;
        }
    }

    async loadEvaluatorSamples(evaluatorId) {
        if (!this.isAuthenticated) {
            throw new Error('Authentication required');
        }

        try {
            let filename;
            if (this.assignmentConfig && this.assignmentConfig.evaluator_files[evaluatorId]) {
                filename = `data/${this.assignmentConfig.evaluator_files[evaluatorId]}`;
            } else {
                // Fallback naming convention
                filename = `data/evaluator_${evaluatorId}_samples.json`;
            }

            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Failed to load samples for evaluator ${evaluatorId}`);
            }
            
            this.evaluatorSamples = await response.json();
            this.evaluatorId = evaluatorId;
            
            console.log(`Loaded ${this.evaluatorSamples.length} samples for evaluator ${evaluatorId}`);
            return true;
        } catch (error) {
            console.error('Error loading evaluator samples:', error);
            throw error;
        }
    }

    loadCompletedEvaluations() {
        const saved = localStorage.getItem(`completedEvaluations_${this.evaluatorId || 'default'}`);
        return saved ? JSON.parse(saved) : [];
    }

    saveCompletedEvaluation(evaluation) {
        this.completedEvaluations.push(evaluation);
        localStorage.setItem(`completedEvaluations_${this.evaluatorId || 'default'}`, 
                            JSON.stringify(this.completedEvaluations));
    }

    generateEvaluationId() {
        return `eval_${this.evaluatorId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCurrentSample() {
        if (!this.evaluatorSamples || this.currentSampleIndex >= this.evaluatorSamples.length) {
            return null;
        }
        return this.evaluatorSamples[this.currentSampleIndex];
    }

    displayCurrentSample() {
        this.currentSample = this.getCurrentSample();
        
        if (!this.currentSample) {
            this.showError('No more samples available');
            return;
        }

        // Update progress info
        document.getElementById('current-sample').textContent = this.currentSampleIndex + 1;
        document.getElementById('total-samples').textContent = this.evaluatorSamples.length;
        
        // Update navigation controls
        const sampleInput = document.getElementById('sample-number-input');
        if (sampleInput) {
            sampleInput.max = this.evaluatorSamples.length;
            sampleInput.value = this.currentSampleIndex + 1;
        }
        
        // Update assignment type indicator
        const assignmentType = this.currentSample.assignment_type || 'unknown';
        const indicator = document.getElementById('assignment-type-indicator');
        if (assignmentType === 'overlap') {
            indicator.innerHTML = '<span class="assignment-badge overlap-badge">Overlap Sample</span>';
        } else if (assignmentType === 'unique') {
            indicator.innerHTML = '<span class="assignment-badge unique-badge">Unique Sample</span>';
        } else {
            indicator.innerHTML = '';
        }

        // Update paper info
        document.getElementById('paper-id').textContent = this.currentSample.paper_id;
        document.getElementById('sample-type').textContent = assignmentType;
        document.getElementById('evaluator-sample-id').textContent = this.currentSample.evaluator_sample_id || this.currentSampleIndex;

        // Show/hide reference badge for overlap samples
        const refBadge = document.getElementById('reference-badge');
        if (assignmentType === 'overlap') {
            refBadge.style.display = 'inline-block';
        } else {
            refBadge.style.display = 'none';
        }

        // Update review content
        document.getElementById('reference-content').textContent = this.currentSample.reference_text;
        document.getElementById('candidate-a-content').textContent = this.currentSample.candidate_a_text;
        document.getElementById('candidate-b-content').textContent = this.currentSample.candidate_b_text;
        
        // Update candidate labels (hide source to avoid bias)
        document.getElementById('candidate-a-label').textContent = 'Candidate A';
        document.getElementById('candidate-b-label').textContent = 'Candidate B';

        // Reset form
        this.resetEvaluationForm();
        
        // Record start time
        this.startTime = Date.now();

        // Update UI state
        document.getElementById('submit-btn').disabled = false;
        document.getElementById('next-btn').disabled = true;
        document.getElementById('results-info').style.display = 'none';
    }

    resetEvaluationForm() {
        // Clear all radio button selections
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.checked = false;
        });

        // Remove selected styling
        const responseOptions = document.querySelectorAll('.response-option');
        responseOptions.forEach(option => {
            option.classList.remove('selected');
        });
    }

    createEvaluationForm() {
        const container = document.getElementById('categories-container');
        container.innerHTML = '';

        Object.entries(this.categories).forEach(([categoryId, category]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-group';
            categoryDiv.innerHTML = `
                <div class="category-title">${category.title}</div>
                <div class="category-description">${category.description}</div>
                <div class="response-options">
                    ${Object.entries(this.responseOptions).map(([optionId, optionLabel]) => `
                        <label class="response-option" onclick="selectOption('${categoryId}', '${optionId}', this)">
                            <input type="radio" name="${categoryId}" value="${optionId}">
                            ${optionLabel}
                        </label>
                    `).join('')}
                </div>
            `;
            container.appendChild(categoryDiv);
        });
    }

    validateEvaluation() {
        const categories = Object.keys(this.categories);
        for (const categoryId of categories) {
            const selected = document.querySelector(`input[name="${categoryId}"]:checked`);
            if (!selected) {
                return { valid: false, missing: categoryId };
            }
        }
        return { valid: true };
    }

    collectEvaluationData() {
        const responses = {};
        Object.keys(this.categories).forEach(categoryId => {
            const selected = document.querySelector(`input[name="${categoryId}"]:checked`);
            responses[categoryId] = selected ? selected.value : null;
        });

        return {
            evaluation_id: this.generateEvaluationId(),
            evaluator_id: this.evaluatorId,
            sample_index: this.currentSampleIndex,
            paper_id: this.currentSample.paper_id,
            assignment_type: this.currentSample.assignment_type,
            evaluator_sample_id: this.currentSample.evaluator_sample_id,
            reference_text: this.currentSample.reference_text,
            candidate_a: {
                label: this.currentSample.candidate_a_label, // Keep original for analysis (may include deepreviewer_partial)
                text: this.currentSample.candidate_a_text
            },
            candidate_b: {
                label: this.currentSample.candidate_b_label, // Keep original for analysis (may include deepreviewer_partial)
                text: this.currentSample.candidate_b_text
            },
            responses: responses,
            metadata: this.currentSample.metadata || {},
            timestamp: new Date().toISOString(),
            evaluation_time_ms: Date.now() - this.startTime
        };
    }

    submitEvaluation() {
        const validation = this.validateEvaluation();
        if (!validation.valid) {
            this.showError(`Please complete all evaluations. Missing: ${this.categories[validation.missing].title}`);
            return;
        }

        const evaluationData = this.collectEvaluationData();
        this.saveCompletedEvaluation(evaluationData);
        
        // Auto-download individual evaluation to prevent data loss
        this.downloadSingleEvaluation(evaluationData);
        
        // Update UI
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('next-btn').disabled = false;
        document.getElementById('results-info').style.display = 'block';
        
        this.updateStats();
        
        console.log('Evaluation submitted:', evaluationData);
    }

    nextSample() {
        this.currentSampleIndex++;
        
        if (this.currentSampleIndex >= this.evaluatorSamples.length) {
            this.showCompletionMessage();
            return;
        }
        
        this.displayCurrentSample();
    }

    previousSample() {
        if (this.currentSampleIndex > 0) {
            this.currentSampleIndex--;
            this.displayCurrentSample();
        }
    }

    goToSample(sampleNumber) {
        const index = sampleNumber - 1; // Convert to 0-based index
        if (index >= 0 && index < this.evaluatorSamples.length) {
            this.currentSampleIndex = index;
            this.displayCurrentSample();
            return true;
        }
        return false;
    }

    showCompletionMessage() {
        const container = document.getElementById('evaluation-interface');
        container.innerHTML = `
            <div class="results-info">
                <h3>🎉 All Evaluations Completed!</h3>
                <p>You have completed all ${this.evaluatorSamples.length} assigned samples.</p>
                <p>Each evaluation has been automatically downloaded as you completed it.</p>
                <p><strong>Thank you for your participation!</strong></p>
            </div>
        `;
    }

    updateStats() {
        const overlapCount = this.completedEvaluations.filter(e => e.assignment_type === 'overlap').length;
        const uniqueCount = this.completedEvaluations.filter(e => e.assignment_type === 'unique').length;
        
        document.getElementById('completed-count').textContent = this.completedEvaluations.length;
        document.getElementById('overlap-count').textContent = overlapCount;
        document.getElementById('unique-count').textContent = uniqueCount;
    }

    downloadSingleEvaluation(evaluationData) {
        // Download individual evaluation immediately to prevent data loss
        const data = {
            evaluator_id: this.evaluatorId,
            evaluation: evaluationData,
            export_timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eval_${this.evaluatorId}_${evaluationData.evaluator_sample_id}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }


    showError(message) {
        const container = document.getElementById('error-container');
        container.innerHTML = `<div class="error-message">${message}</div>`;
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    showEvaluatorInfo(evaluatorId) {
        const infoDiv = document.getElementById('evaluator-info');
        const detailsDiv = document.getElementById('assignment-details');
        
        if (this.assignmentConfig) {
            const overlapSamples = this.evaluatorSamples.filter(s => s.assignment_type === 'overlap').length;
            const uniqueSamples = this.evaluatorSamples.filter(s => s.assignment_type === 'unique').length;
            
            detailsDiv.innerHTML = `
                <div class="assignment-info">
                    <div><strong>Total Samples:</strong> ${this.evaluatorSamples.length}</div>
                    <div><strong>Overlap Samples:</strong> ${overlapSamples} (evaluated by all evaluators)</div>
                    <div><strong>Unique Samples:</strong> ${uniqueSamples} (specific to you)</div>
                    <div><strong>Assignment Type:</strong> Hybrid evaluation</div>
                </div>
            `;
        } else {
            detailsDiv.innerHTML = `
                <div><strong>Samples Loaded:</strong> ${this.evaluatorSamples.length}</div>
                <div><strong>Assignment Type:</strong> Standard evaluation</div>
            `;
        }
        
        infoDiv.style.display = 'block';
    }
}

// Global instance
let evaluationSystem;

// Global functions for HTML onclick handlers
function authenticateAndLoad() {
    const accessCodeInput = document.getElementById('access-code');
    const evaluatorIdInput = document.getElementById('evaluator-id');
    const accessCode = accessCodeInput.value.trim();
    const evaluatorId = evaluatorIdInput.value;
    
    // Clear previous error
    document.getElementById('auth-error').style.display = 'none';
    
    // Validate inputs
    if (!accessCode) {
        showAuthError('Please enter an access code');
        return;
    }
    
    if (evaluatorId === '' || evaluatorId < 0) {
        showAuthError('Please enter a valid evaluator ID (0, 1, 2, ...)');
        return;
    }
    
    // Authenticate
    if (!evaluationSystem.authenticate(accessCode)) {
        showAuthError('Invalid access code. Please contact the research team for the correct code.');
        return;
    }
    
    // Load samples
    evaluationSystem.loadEvaluatorSamples(evaluatorId)
        .then(() => {
            // Hide auth gate, show evaluation interface
            document.getElementById('auth-gate').style.display = 'none';
            document.getElementById('evaluation-interface').style.display = 'block';
            
            // Show evaluator info
            evaluationSystem.showEvaluatorInfo(evaluatorId);
            
            // Create evaluation form
            evaluationSystem.createEvaluationForm();
            
            // Display first sample
            evaluationSystem.displayCurrentSample();
        })
        .catch(error => {
            showAuthError(`Failed to load samples for evaluator ${evaluatorId}. Please check your ID and try again.`);
        });
}

function showAuthError(message) {
    const errorDiv = document.getElementById('auth-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function loadEvaluatorSamples() {
    // Legacy function - redirect to authentication
    authenticateAndLoad();
}

function selectOption(categoryId, optionId, element) {
    // Remove selected class from all options in this category
    const categoryContainer = element.closest('.category-group');
    const allOptions = categoryContainer.querySelectorAll('.response-option');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to clicked option
    element.classList.add('selected');
    
    // Check the radio button
    const radio = element.querySelector('input[type="radio"]');
    radio.checked = true;
}

function submitEvaluation() {
    evaluationSystem.submitEvaluation();
}

function nextSample() {
    evaluationSystem.nextSample();
}

function previousSample() {
    evaluationSystem.previousSample();
}

function goToSample() {
    const input = document.getElementById('sample-number-input');
    const sampleNumber = parseInt(input.value);
    
    if (isNaN(sampleNumber) || sampleNumber < 1 || sampleNumber > evaluationSystem.evaluatorSamples.length) {
        evaluationSystem.showError(`Please enter a valid sample number (1-${evaluationSystem.evaluatorSamples.length})`);
        return;
    }
    
    evaluationSystem.goToSample(sampleNumber);
}


// Initialize the system when page loads
document.addEventListener('DOMContentLoaded', function() {
    evaluationSystem = new HybridEvaluationSystem();
    
    // Check if user is already authenticated
    if (evaluationSystem.checkExistingAuth()) {
        console.log('User already authenticated in this session');
        // Could auto-show interface or keep auth gate for evaluator ID selection
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(event) {
        // Only handle navigation when evaluation interface is visible and no input is focused
        const evaluationInterface = document.getElementById('evaluation-interface');
        const isEvaluationVisible = evaluationInterface && evaluationInterface.style.display !== 'none' && evaluationSystem.evaluatorSamples;
        const isInputFocused = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
        
        // Handle Enter key on sample number input
        if (isInputFocused && document.activeElement.id === 'sample-number-input' && event.key === 'Enter') {
            event.preventDefault();
            goToSample();
            return;
        }
        
        if (!isEvaluationVisible || isInputFocused) {
            return;
        }
        
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                evaluationSystem.previousSample();
                break;
            case 'ArrowRight':
                event.preventDefault();
                evaluationSystem.nextSample();
                break;
        }
    });
});