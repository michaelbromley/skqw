/**
 * Toggle sidebar on mobile
 */
document.querySelector('.sidebar-toggle').addEventListener('click', function() {
    var sidebar = document.querySelector('.sidebar');
    if (sidebar.classList.contains('in')) {
        sidebar.classList.remove('in');
    } else {
        sidebar.classList.add('in');
    }
});