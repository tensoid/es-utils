<template>
  <header class="navbar">
    <h2>ES-Utils</h2>
    <ul>
      <li><RouterLink to="/">Home</RouterLink></li>
      <li><RouterLink to="/quine-mcclusky">Quine-McCluskey</RouterLink></li>
      <li><RouterLink to="/base-converter">Base Converter</RouterLink></li>
      <li><RouterLink to="/twos-complement">Two's complement</RouterLink></li>
    </ul>
  </header>
</template>

<style scoped lang="scss">

  .navbar {

    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-background-soft);
    height: 3.5rem;
    padding: 0 1rem 0 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      gap: 1rem;

      a {
        transition: text-decoration-color 300ms;
        text-decoration: underline 0.15rem rgba(var(--color-highlight), 1.0);
        text-underline-offset: 0.25rem;
        
        &:hover {
          text-decoration-color: var(--color-highlight);
        }
      }
    }
  }
</style>