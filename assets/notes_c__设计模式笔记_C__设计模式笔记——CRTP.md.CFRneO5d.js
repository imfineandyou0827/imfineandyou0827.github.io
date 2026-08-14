import{_ as a,c as n,o as p,ae as e}from"./chunks/framework.Dgg8-8ov.js";const h=JSON.parse('{"title":"C++设计模式笔记——CRTP","description":"","frontmatter":{"title":"C++设计模式笔记——CRTP","lang":"zh-CN","date":"2024-07-03T00:00:00.000Z","tags":["学习","笔记"],"summary":"CRTP"},"headers":[],"relativePath":"notes/c++设计模式笔记/C++设计模式笔记——CRTP.md","filePath":"notes/c++设计模式笔记/C++设计模式笔记——CRTP.md"}'),l={name:"notes/c++设计模式笔记/C++设计模式笔记——CRTP.md"};function i(t,s,c,o,d,u){return p(),n("div",null,s[0]||(s[0]=[e(`<p>CRTP(curiously recurring template pattern, 奇异递归模式)，这个名字奇怪的模式，是一种将继承和静态多态结合的技术。</p><blockquote><p>多态是一种用单个统一的符号将多种特定行为关联起来的能力，是面向对象编的基石，在 C++中它主要由继承和虚函数实现。由于这一机制主要（至少是一部分）在运行期间起作用，因此我们称之为动态多态（dynamic polymorphism）。它也是我们通常在讨论 C++中的简单多态时所指的多态。但是，模板也允许我们用单个统一符号将不同的特定行为 关联起来，不过该关联主要发生在编译期间，我们称之为静态多态（static polymorphism）。</p></blockquote><h2 id="使用crtp的动机" tabindex="-1"><strong>使用CRTP的动机</strong> <a class="header-anchor" href="#使用crtp的动机" aria-label="Permalink to &quot;**使用CRTP的动机**&quot;">​</a></h2><blockquote><p>性能在C++中极为重要，而使用虚函数存在性能开销。因此，在对性能敏感的环境中，例如计算机游戏或高频交易的某些部分，不会使用虚函数。在高性能计算（HPC）中也是如此。在HPC中，任何类型的条件判断或间接寻址，包括虚函数，都被禁止在性能最关键的部分使用。</p></blockquote><p>接下来将举一个例子，分别用动态多态、静态多态和CRTP实现，例子原型来自：</p><blockquote><p><a href="https://en.cppreference.com/w/cpp/language/crtp" target="_blank" rel="noreferrer">https://en.cppreference.com/w/cpp/language/crtp</a></p></blockquote><h2 id="动态多态实现" tabindex="-1">动态多态实现 <a class="header-anchor" href="#动态多态实现" aria-label="Permalink to &quot;动态多态实现&quot;">​</a></h2><p>假设有一个基类<code>Base</code>，其中有一个纯虚函数<code>impl()</code></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Base</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    virtual void impl()=0;</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>接着有两个<code>Base</code>的派生类:D1,D2,各自实现了<code>impl()</code>函数:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class D1:public Base</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    virtual void impl() override</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        std::cout&lt;&lt;&quot;D1:impl()&quot;&lt;&lt;std::endl;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class D2:public Base</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    virtual void impl() override</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        std::cout&lt;&lt;&quot;D2:impl()&quot;&lt;&lt;std::endl;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>我们可以在函数中调用：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void exec(Base &amp;obj)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>    obj.impl();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>int main()</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>    D1 d1;</span></span>
<span class="line"><span>    D2 d2;</span></span>
<span class="line"><span>    exec(d1);</span></span>
<span class="line"><span>    exec(d2);</span></span>
<span class="line"><span>    return 0;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>结果就会打印输出：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>D1::impl()</span></span>
<span class="line"><span>D2::impl()</span></span></code></pre></div><h2 id="静态多态实现" tabindex="-1"><strong>静态多态实现</strong> <a class="header-anchor" href="#静态多态实现" aria-label="Permalink to &quot;**静态多态实现**&quot;">​</a></h2><p>同样可以用静态多态来实现上面的功能，静态多态通过模板来实现，首先同样是定义类<code>D1</code>和<code>D2</code>,不同的是这回它们不再是派生类：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class D1</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    void impl() </span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        std::cout&lt;&lt;&quot;D1:impl()&quot;&lt;&lt;std::endl;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class D2</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    void impl() </span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        std::cout&lt;&lt;&quot;D2:impl()&quot;&lt;&lt;std::endl;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>接着实现一个模板函数:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>template &lt;typename T&gt;</span></span>
<span class="line"><span>void exec(T obj)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>    obj.impl();</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们就可以调用这个函数达到多态的目的：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int main()</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>    D1 d1;</span></span>
<span class="line"><span>    D2 d2;</span></span>
<span class="line"><span>    exec(d1);</span></span>
<span class="line"><span>    exec(d2);</span></span>
<span class="line"><span>    return 0; </span></span>
<span class="line"><span>}</span></span></code></pre></div><p>结果同样会打印输出：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>D1::impl()</span></span>
<span class="line"><span>D2::impl()</span></span></code></pre></div><p>静态多态在编译器就确认了<code>exec</code>中具体调用哪个函数，比动态多态在运行期根据虚函数表去查找有性能的提升。但是从静态多态的例子中我们可以发现，<code>D1</code>和<code>D2</code>不是继承某个基类，意味着没有代码复用。就算<code>D1</code>类和<code>D2</code>类中其他函数都相同，只有<code>impl</code>函数的实现不同，<code>D1</code>和<code>D2</code>类还是要重复那些实现相同的函数。</p><h2 id="crtp-模式实现" tabindex="-1"><strong>CRTP 模式实现</strong> <a class="header-anchor" href="#crtp-模式实现" aria-label="Permalink to &quot;**CRTP 模式实现**&quot;">​</a></h2><p>CRTP模式将继承和静态多态结合，既能通过静态多态提升性能，也能通过继承进行代码复用。CRTP实际实现是将派生类作为模板参数传递给其某个基类。</p><p>首先定义一个模板基类<code>Base</code>:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>template &lt;typename T&gt;</span></span>
<span class="line"><span>class Base</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>    void impl()</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        static_cast&lt;T *&gt;(this)-&gt;impl();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    void exec()</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        std::cout&lt;&lt;&quot;Base::exec()&quot;&lt;&lt;std::endl;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>接着<code>D1</code>和<code>D2</code>分别将自己作为模板参数传递给<code>Base</code>:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class D1:Base&lt;D1&gt;</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    void impl() </span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        std::cout&lt;&lt;&quot;D1:impl()&quot;&lt;&lt;std::endl;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class D2:Base&lt;D2&gt;</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>public:</span></span>
<span class="line"><span>    void impl() </span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        std::cout&lt;&lt;&quot;D2:impl()&quot;&lt;&lt;std::endl;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>};</span></span></code></pre></div><p>我们就可以使用：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int main()</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>    D1 d1;</span></span>
<span class="line"><span>    D2 d2;</span></span>
<span class="line"><span>    d1.impl();</span></span>
<span class="line"><span>    d2.impl();</span></span>
<span class="line"><span>    d1.exec();</span></span>
<span class="line"><span>    d2.exec();</span></span>
<span class="line"><span>    return 0;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>输出结果是：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>D1::impl()</span></span>
<span class="line"><span>D2::impl()</span></span>
<span class="line"><span>Base::exec()</span></span>
<span class="line"><span>Base::exec()</span></span></code></pre></div><p><strong>CRTP的缺点</strong></p><p>CRTP的例子中我们可以发现，D1和D2缺少共同的基类，没错，D1和D2继承的不是同一个基类。 D1的基类是Base&lt;D1&gt;,D2的基类是Base&lt;D2&gt;。</p><blockquote><p>因此，每当需要一个共同的基类时，例如，为了在一个集合中存储不同类型而需要的共同抽象，CRTP设计模式就不是正确的选择。</p></blockquote>`,38)]))}const g=a(l,[["render",i]]);export{h as __pageData,g as default};
