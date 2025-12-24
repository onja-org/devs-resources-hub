import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export async function removeDuplicateResources() {
  const resourcesRef = collection(db, 'resources');
  
  try {
    console.log('Fetching all resources...');
    const snapshot = await getDocs(resourcesRef);
    
    // Map to track first occurrence of each link
    const seenLinks = new Map<string, string>(); // link -> docId
    const duplicateIds: string[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const link = data.link;
      
      if (seenLinks.has(link)) {
        // This is a duplicate, mark for deletion
        duplicateIds.push(doc.id);
        console.log(`Found duplicate: ${data.title} (${doc.id})`);
      } else {
        // First occurrence, keep it
        seenLinks.set(link, doc.id);
      }
    });
    
    console.log(`Found ${duplicateIds.length} duplicates to remove`);
    
    // Delete duplicates
    for (const id of duplicateIds) {
      await deleteDoc(doc(db, 'resources', id));
      console.log(`Deleted duplicate resource: ${id}`);
    }
    
    console.log(`Successfully removed ${duplicateIds.length} duplicate resources`);
    console.log(`Kept ${seenLinks.size} unique resources`);
    
    return { 
      success: true, 
      removed: duplicateIds.length,
      remaining: seenLinks.size 
    };
  } catch (error: any) {
    console.error('Error removing duplicates:', error);
    return { success: false, error };
  }
}
