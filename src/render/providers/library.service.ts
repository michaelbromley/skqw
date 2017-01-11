import { Injectable } from '@angular/core';
import {State} from './state.service.';
import {Visualization, LibraryEntry} from '../../common/models';

/**
 * This service manages the paths to the visualization scripts.
 */
@Injectable()
export class LibraryService {

    constructor(private state: State) { }

    /**
     * Get all library entries.
     */
    getLibrary(): LibraryEntry[] {
        return this.state.getValue().library;
    }

    /**
     * Get a single entry by id.
     */
    getEntry(id: string): LibraryEntry {
        const matches = this.getLibrary().filter(e => e.id === id);
        if (matches.length === 1) {
            return matches[0];
        }
    }

    /**
     * Add a path to the library
     */
    addEntry(path: string, visualization: Visualization): void {
        const library = this.state.getValue().library;
        const entry = this.generateLibraryEntry(path, visualization);
        if (library.map(e => e.id).indexOf(entry.id) === -1) {
            library.push(entry);
            this.state.set('library', library);
        }
    }

    /**
     * Remove a path from the library.
     */
    removeEntry(id: string): void {
        const library = this.state.getValue().library.filter(e => e.id !== id);
        this.state.set('library', library);
    }

    private generateLibraryEntry(path: string, visualization: Visualization): LibraryEntry {
        const name = visualization.name;
        const id = this.hashCode(name + JSON.stringify(visualization.params));
        return {
            id,
            name,
            path
        };
    }

    /**
     * Generate a hash from the string input. Based on http://stackoverflow.com/a/8831937/772859
     */
    private hashCode(input: string): string {
    	let hash = 0;
    	if (input.length == 0) {
    	    return '0';
        }
    	for (let i = 0; i < input.length; i++) {
    		let char = input.charCodeAt(i);
    		hash = ((hash<<5)-hash)+char;
    		hash &= hash; // Convert to 32bit integer
    	}
    	return Math.abs(hash).toString(36);
    }

}