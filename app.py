from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Load your Python scripts
import role_categories
import group_restrictions
import rolelist_presets
import randomizer

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/roll', methods=['POST'])
def roll():
    data = request.get_json()
    # Process the data using your Python scripts
    results = randomizer.process(data)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
